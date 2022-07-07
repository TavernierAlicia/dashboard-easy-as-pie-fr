export default function home() {

    let orderTimeTO = null;
    let WS = null;

    let stopws = false;

    let etab_id = null;

    const padTo2Digits = num => {
        return num.toString().padStart(2, '0');
    }

    const getUTCDate = _ => {
        let date = new Date();
        return new Date((
            [
                date.getFullYear(),
                padTo2Digits(date.getUTCMonth() + 1),
                padTo2Digits(date.getUTCDate()),
            ].join('-') +
            ' ' +
            [
                padTo2Digits(date.getUTCHours()),
                padTo2Digits(date.getUTCMinutes()),
                padTo2Digits(date.getUTCSeconds()),
            ].join(':')
        ));
    }

    const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    const init = (context, params) => {
        app.services.setTemplate('home.html').then(_ => app.services.setHeader()).then(_ => getOrders()).then(_ => getWS());
        return true;
    };

    const getOrders = _ => {
        return app.services.http(true).get('/orders')        
            .then(res => setOrders(res))
        ;
    };

    const getWS = _ => {
        return app.services.http(true).get('/menu')
            .then(res => etab_id = res.Id)
            .then(_ => setWS())
    };

    let WSTO = null;
    const setWS = _ => {
        if (WS) return;
        if (stopws) return;
        if (!etab_id) return;
        WS = new WebSocket('ws://ws.easy-as-pie.fr/orders?etabid=' + etab_id + '&authorization=' + localStorage.getItem('user_token'));
        WS.onclose = _ => {
            WS = null;
            WSTO = setTimeout(_ => setWS(), 2000)
        };
        WS.onmessage = msg => {
            // const message = JSON.parse(msg.data);
            if (msg) getOrders();
        };
    }



    const setOrders = orders => {
        if (orderTimeTO) clearTimeout(orderTimeTO);
        const orderTPL = document.getElementById('card-tpl');
        const received = document.getElementById('received_orders');
        const toserve = document.getElementById('to_serve');
        const ontable = document.getElementById('on_table');
        received.innerHTML = "";
        toserve.innerHTML = "";
        ontable.innerHTML = "";

        const date = getUTCDate();

        orders.sort((a, b) => -1 * a.Date.localeCompare(b.Date))

        for (let order of orders) {

            let secs = Math.round((date.getTime() - new Date(order.Date).getTime()) / 1000);
            let min = Math.floor(secs / 60);
            // if (min > 60) continue;

            let card = document.importNode(orderTPL.content, true);
            card.querySelector('.card-id').textContent = "#" + order.Id;
            let status = card.querySelector('.status');
            status.dataset.orderid = order.Id;
            card.querySelector('.card-price').textContent = formatPrice.format(order.TotalTTC);
            let duration = card.querySelector('.card-duration');
            duration.dataset.creationdate = order.Date;

            let products = card.querySelector('.p2');
            for (let item of order.Order_items) {
                let p = document.createElement('p');
                p.textContent = item.Quantity + " " + item.Name;
                products.appendChild(p);
            }

            secs = secs - min * 60;
            duration.textContent = padTo2Digits(min) + ":" + padTo2Digits(secs);
            if (order.Confirmed && !order.Ready) {
                received.appendChild(card);
                status.textContent = "Prêt !";
                status.style.cursor = "pointer";
                status.setAttribute('onclick', 'app.current.updateOrder(event, "ready");')
            } else if (order.Confirmed && order.Ready && !order.Done) {
                status.style.cursor = "pointer";
                status.textContent = "Servi !";
                status.setAttribute('onclick', 'app.current.updateOrder(event, "done");')
                toserve.appendChild(card);
            } else if (order.Confirmed && order.Ready && order.Done) {
                status.textContent = "Fini";
                duration.className = "";
                ontable.appendChild(card);
            }
        }
        for (let container of [received, toserve, ontable]) {
            if (!container.childElementCount) {
                let h4 = document.createElement('h4');
                h4.textContent = "Pas de commande pour le moment.";
                h4.style.textAlign = "center"
                container.appendChild(h4);
            }
        }
        orderTimeTO = setTimeout(_ => setOrderTime(), 1000);
    }

    const setOrderTime = _ => {
        if (orderTimeTO) clearTimeout(orderTimeTO);
        const date = getUTCDate();
        for (let order of document.getElementsByClassName('card1')) {
            let duration = order.querySelector('.card-duration');
            if (!duration) continue;
            let secs = Math.round((date.getTime() - new Date(duration.dataset.creationdate).getTime()) / 1000);
            let min = Math.floor(secs / 60);
            secs = secs - min * 60;
            duration.textContent = padTo2Digits(min) + ":" + padTo2Digits(secs);
        }
        orderTimeTO = setTimeout(_ => setOrderTime(), 1000);
    }

    const updateOrder = (event, type) => {
        const data = {
            order_id: parseInt(event.currentTarget.dataset.orderid),
            confirmed: true,
            ready: true,
            done: type == 'done'
        }
        return app.services.http(true).put('/update-order', data)
            .then(_ => getOrders());
    }


    const destroy = _ => {
        if (orderTimeTO) clearTimeout(orderTimeTO);
        if (WS) WS.close();
        stopws = true;
        if (WSTO) clearTimeout(WSTO);
    };

    return {
        init: init,
        updateOrder: updateOrder,
        destroy: destroy

    }

};