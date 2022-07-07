export default function orders() {

    const padTo2Digits = num => {
        return num.toString().padStart(2, '0');
    }

    const getUTCDate = date => {
        return (
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
        );
    }

    const current = new Date();

    
    const data = {
        date_max: getUTCDate(current),
        date_min: null
    };
    
    current.setMonth(current.getMonth() - 1);
    
    data.date_min = getUTCDate(current);

    const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    

    const init = (context, params) => {
        app.services.setTemplate('orders.html')
            .then(_ => app.services.setHeader())
            .then(_ => document.getElementById('date1').value = data.date_min.split(" ")[0])
            .then(_ => document.getElementById('date2').value = data.date_max.split(" ")[0])
            .then(_ => getFacts());
        return true;
    };

    const getFacts = _ => {
        app.services.http(true).get('/all-tickets', data)
            .then(res => {
                const container = document.getElementById('list-fact');
                if (!res || res.length == 0) {

                    let tr = document.createElement('tr');
                    let td = document.createElement('td');
                    td.colSpan = 6;
                    td.textContent = "Aucune facture disponible";
                    td.style.textAlign = "center";
                    tr.appendChild(td);
                    container.appendChild(tr)
                    return;
                }
                res.sort((a, b) => -1 * a.Date.localeCompare(b.Date));
                for (let fact of res) {
                    let tr = document.createElement('tr');
                    let id = document.createElement('td');
                    id.textContent = "#" + fact.Id;
                    tr.appendChild(id);
                    let cli = document.createElement('td');
                    cli.textContent = fact.Cli_uuid;
                    tr.appendChild(cli);
                    let date = document.createElement('td');
                    let utcdate = new Date(fact.Date.replace(' ', 'T') + ".000Z");
                    date.textContent = utcdate.toLocaleDateString("fr");
                    tr.appendChild(date);
                    let price = document.createElement('td');
                    price.textContent = formatPrice.format(fact.Total);
                    tr.appendChild(price);
                    let status = document.createElement('td');
                    status.textContent = fact.IsDone ? "Servi" : "Payé";
                    tr.appendChild(status);
                    let btns = document.createElement('td');
                    let open = document.createElement('img');
                    open.src = "../img/icons/search.png";
                    open.setAttribute('onclick', 'app.current.openFact("' + fact.Link + '")');
                    btns.appendChild(open);
                    let dll = document.createElement('img');
                    dll.src = "../img/icons/download.png"
                    dll.setAttribute('onclick', 'app.current.downloadFact("' + fact.Link  +'")');
                    btns.appendChild(dll);
                    tr.appendChild(btns);
                    container.appendChild(tr);
                }
            })
        ;

    };

    const openFact = pdf => {
        const popup =   document.getElementById('popup_fact');
        const preview = document.getElementById('fact_preview');
        if (preview) popup.removeChild(preview);
        const embed = document.createElement('embed');
        embed.height = "375";
        embed.width = "500";
        embed.id = "fact_preview";
        embed.src = "https://drive.google.com/viewerng/viewer?embedded=true&url=" + pdf;
        popup.insertBefore(embed, popup.firstChild);
        popup.classList.remove('hide');
    }

    const downloadFact = pdf => {
        window.open(pdf, '_blank');
    }

    const downloadCSV = _ => {
        app.services.http(true).get('/csv', {start:  document.getElementById('date1').value + " 00:00:00", end:  document.getElementById('date2').value + " 00:00:00" })
            .then(res => window.open(res, '_blank'))
        ;
    }

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy,

        downloadFact: downloadFact,
        openFact: openFact,

        downloadCSV: downloadCSV

    }

};