export default function menu() {

    let categories = [];
    let items      = {};

    const init = (context, params) => {
        app.services.setTemplate('menu.html')
            .then(_ => app.services.setHeader())
            .then(_ => getCategories())
        ;
        
        return true;
    };

    const getCategories = _ => {
        return app.services.http(true).get('/categories')
            .then(res => categories = res && res.length ? res : [])
            .then(_ => getMenu())
        ;
    };

    const getMenu = _ => {
        return app.services.http(true).get('/menu')
            .then(res => items = res.Items)
            .then(_ => setMenu())
        ;
    };

    const setMenu = _ => {
        const container = document.getElementById('products');
        const itemTPL = document.getElementById('item-tpl');
        container.innerHTML = "";
        const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

        // Sort 
        const drinks = items.reduce((result, currentValue) => {
            (result[currentValue.CategoryID] = result[currentValue.CategoryID] || []).push(currentValue);
            return result;
        }, {});

        for (let cat in drinks) {
            let catid = parseInt(cat);
            let div = document.createElement('div');
            div.className = "card_con";
            let cate = document.createElement('div');
            cate.className = "heading";
            cate.innerText = categories.find(c => c.Id == catid).Name;
            div.appendChild(cate);
            let items_container = document.createElement('div');
            items_container.className = "cards";
            for (let i of drinks[catid]) {
                let item = document.importNode(itemTPL.content, true);
                item.querySelector('.card').dataset.id = i.Id;
                item.querySelector('.item-name').textContent = i.Name;
                item.querySelector('.item-desc').textContent = i.Desc;
                item.querySelector('.item-price').textContent = formatPrice.format(i.Price);
                items_container.appendChild(item);
            }
            div.appendChild(items_container);
            container.appendChild(div);
        }
    };

    const addDrinkForm = _ => {
        if (!categories.length) return swal("Aucune cat??gorie", "Afin d'ajouter une boisson, merci de cr??er au moins une cat??gorie", "error");
        app.services.setModule('ajout_boisson.html').then(_ => {
            const opt = document.querySelector('#ajoutBoisson #add-drink-cate');
            for (let cat of categories) {
                let div = document.createElement('option');
                div.value = cat.Id;
                div.innerText = cat.Name;
                opt.appendChild(div);
            }
        })
    };

    const editDrinkForm = event => {

        const item_id = event.currentTarget.parentNode.parentNode.dataset.id;
        const item = items.find(i => i.Id == parseInt(item_id));

        app.services.setModule('modifier_boisson.html').then(_ => {
            document.getElementById('edit-drink-btn').dataset.id = item_id;
            document.getElementById('drink-name').textContent = item.Name;
            document.getElementById('edit-drink-name').value = item.Name;
            document.getElementById('edit-drink-desc').value = item.Desc;
            document.getElementById('edit-drink-price').value = item.Price;
            document.getElementById('edit-drink-stock').checked = item.Stock;
            if (item.Price != item.HHPrice) document.getElementById('edit-drink-price-hh').value = item.HHPrice;
        });
    };

    const addDrink = _ => {
        const cate = document.getElementById('add-drink-cate').selectedOptions[0].value;
        if (!cate) return swal("Erreur lors de la cr??ation", "Merci de renseigner la cat??gorie de la boisson ?? cr??er", "error");
        const name = document.getElementById('add-drink-name').value;
        if (!name) return swal("Erreur lors de la cr??ation", "Merci de renseigner le nom de la boisson ?? cr??er", "error");
        const desc = document.getElementById('add-drink-desc').value;
        const price = document.getElementById('add-drink-price').value;
        if (!price) return swal("Erreur lors de la cr??ation", "Merci de renseigner le prix de la boisson ?? cr??er", "error");
        const priceHH = document.getElementById('add-drink-price-hh').value;
        return app.services.http(true).post('/item', {name: name, category: cate, price: parseFloat(price), priceHH: parseFloat(priceHH || price), description: desc, in_stock: true})
            .then(_ => app.services.cleanModule())
            .then(_ => {getMenu();})
            .then(_ => swal("", "La boisson a bien ??t?? cr????.", "success"))
            .catch(err => {
                console.error(err);
                return swal("Erreur lors de la cr??ation", "Une erreur est survenue lors de la cr??ation de la boisson. Merci de r??essayer plus tard.", "error")
            })
        ;
    };

    const editDrink = event => {
        const item_id = event.currentTarget.dataset.id;
        const item = items.find(i => i.Id == parseInt(item_id));

        const name = document.getElementById('edit-drink-name').value || item.Name;
        const desc = document.getElementById('edit-drink-desc').value;
        const price = document.getElementById('edit-drink-price').value || item.Price;
        const priceHH = document.getElementById('edit-drink-price-hh').value;

        return app.services.http(true).put('/item', {id: item.Id, name: name, category: item.CategoryID.toString(), price: parseFloat(price), priceHH: parseFloat(priceHH || price), description: desc, in_stock: document.getElementById('edit-drink-stock').checked})
            .then(_ => app.services.cleanModule())
            .then(_ => {getMenu();})
            .then(_ => swal("", "La boisson a bien ??t?? modifi??.", "success"))
            .catch(err => {
                console.error(err);
                return swal("Erreur lors de la modification", "Une erreur est survenue lors de la modification de la boisson. Merci de r??essayer plus tard.", "error");
            })
        ;
    };

    const deleteDrink = event => {

        const item_id = event.currentTarget.parentNode.parentNode.dataset.id;
        const item = items.find(i => i.Id == parseInt(item_id));

        return swal("Suppression", "??tes vous sur de vouloir supprimer la boisson " + item.Name + " ? Cette action sera irr??versible.", "warning", {
            buttons: {
                cancel: "Retour",
                confirm: {
                    text: "Oui !",
                    value: 'ok',
                    className: "swal-button--danger"
                }
            },
            dangerMode: true,
          }).then(res => {
                if (res && res == "ok") {
                    return app.services.http(true).delete('/item', {item_id: item.Id})
                        .then(_ => {getMenu();})
                        .then(_ => swal("", "La boisson a bien ??t?? supprim??.", "success"))
                        .catch(err => {
                            console.error(err);
                            return swal("Erreur lors de la suppression", "Une erreur est survenue lors de la suppression de la boisson. Merci de r??essayer plus tard.", "error");
                        })
                    ;
                }
          });
    };

    const gestionCategorie = _ => {
        app.services.setModule('gestion_categorie.html').then(_ => {
            const opts = document.querySelectorAll('#gestionCategorie select');
            for (let opt of opts) {
                for (let cat of categories) {
                    let div = document.createElement('option');
                    div.value = cat.Id;
                    div.innerText = cat.Name;
                    opt.appendChild(div);
                }
            }
        });
    };

    const addCategorie = _ => {
        const name = document.getElementById('add-cate-name').value;
        if (!name) return swal("Erreur lors de la cr??ation", "Merci de renseigner le nom de la cat??gorie ?? cr??er", "error");
        return app.services.http(true).post('/categories', {name: name})
            .then(_ => app.services.cleanModule())
            .then(_ => {getCategories();})
            .then(_ => swal("", "La cat??gorie a bien ??t?? ajout??.", "success"))
            .catch(err => {
                console.error(err);
                return swal("Erreur lors de la cr??ation", "Une erreur est survenue lors de la cr??ation de la cat??gorie. Merci de r??essayer plus tard.", "error")
            })
        ;
    };

    const editCategorie = _ => {
        const cate = document.getElementById('edit-cate').selectedOptions[0].value;
        if (!cate) return swal("Erreur lors de la modification", "Merci de selectionner la cat??gorie ?? renommer", "error");
        const newname = document.getElementById('edit-cate-name').value;
        if (!newname) return swal("Erreur lors de la modification", "Merci de selectionner le nouveau nom de la cat??gorie", "error");
        return app.services.http(true).put('/categories', {id: parseInt(cate), name: newname})
            .then(_ => app.services.cleanModule())
            .then(_ => {getCategories();})
            .then(_ => swal("", "La cat??gorie a bien ??t?? modifi??.", "success"))
            .catch(err => {
                console.error(err);
                return swal("Erreur lors de la modification", "Une erreur est survenue lors de la modification de la cat??gorie. Merci de r??essayer plus tard.", "error")
            })
        ;
    };

    const deleteCategorie = _ => {
        const cate = document.getElementById('remove-cate').selectedOptions[0].value;
        if (!cate) return swal("Erreur lors de la suppression", "Merci de selectionner la cat??gorie ?? supprimer", "error");
        return app.services.http(true).delete('/categories', {id: parseInt(cate)})
            .then(_ => app.services.cleanModule())
            .then(_ => {getCategories();})
            .then(_ => swal("", "La cat??gorie a bien ??t?? supprim??.", "success"))
            .catch(err => {
                console.error(err);
                return swal("Erreur lors de la suppression", "Une erreur est survenue lors de la suppression de la cat??gorie. Merci de r??essayer plus tard.", "error")
            })
        ;
    };

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy,

        addCategorie: addCategorie,
        editCategorie: editCategorie,
        deleteCategorie: deleteCategorie,
        gestionCategorie: gestionCategorie,
        
        
        addDrink: addDrink,
        addDrinkForm: addDrinkForm,
        editDrink: editDrink,
        editDrinkForm: editDrinkForm,
        deleteDrink: deleteDrink
    }

};