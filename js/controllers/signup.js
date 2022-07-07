export default function signup() {

    let selectedPlan = null;

    const init = context => {
        app.services.setTemplate('signup.html');
        return true;
    };

    const choosePlan = elem => {
        for (let plan of elem.parentNode.children) plan.classList.remove('select');
        elem.classList.add('select');
        selectedPlan = elem.id;
    };

    const step = nbstep => {
        if (!nbstep) return;
        nbstep = parseInt(nbstep);
        const stepContainer = document.getElementById('step');
        let currentStep = stepContainer.className;
        if (!currentStep) return;
        currentStep = parseInt(currentStep.replace('step', ''));
        if (currentStep < nbstep) {
            // Check
            if (currentStep == 1) {
                if (!document.getElementById('nom').value) return swal('Champ non rempli', "Vous devez renseigner votre nom avant de passer à l'étape suivante", "error");
                if (!document.getElementById('prenom').value) return swal('Champ non rempli', "Vous devez renseigner votre prénom avant de passer à l'étape suivante", "error");
                if (!document.getElementById('email').value) return swal('Champ non rempli', "Vous devez renseigner votre adresse mail avant de passer à l'étape suivante", "error");
                if (!document.getElementById('phone').value) return swal('Champ non rempli', "Vous devez renseigner votre numéro de téléphone avant de passer à l'étape suivante", "error");
            }
            if (currentStep == 2) {
                if (!selectedPlan) return swal('Choix de la formule', "Vous devez choisir une formule afin de passer à l'étape suivante", "error");
            }
            if (currentStep == 3) {
                if (!document.getElementById('etabname').value) return swal('Champ non rempli', "Vous devez renseigner le nom de votre établissement avant de passer à l'étape suivante", "error");
                if (!document.getElementById('adresse').value) return swal('Champ non rempli', "Vous devez renseigner l'adresse de votre établissement avant de passer à l'étape suivante", "error");
                if (!document.getElementById('zipcode').value) return swal('Champ non rempli', "Vous devez renseigner le code postal de votre établissement avant de passer à l'étape suivante", "error");
                if (!document.getElementById('city').value) return swal('Champ non rempli', "Vous devez renseigner la ville de votre établissement avant de passer à l'étape suivante", "error");
                if (!document.getElementById('siret').value) return swal('Champ non rempli', "Vous devez renseigner votre numéro de SIRET avant de passer à l'étape suivante", "error");
                if (!document.getElementById('licence').value) return swal('Champ non rempli', "Vous devez renseigner votre numéro de licence avant de passer à l'étape suivante", "error");
            }

            if (currentStep == 4) {
                if (!document.getElementById('iban').value) return swal('Champ non rempli', "Vous devez renseigner votre IBAN avant de valider votre inscription", "error");
                if (!document.getElementById('fact_nom').value) return swal('Champ non rempli', "Vous devez renseigner votre nom de facturation avant de valider votre inscription", "error");
                if (!document.getElementById('fact_adresse').value) return swal('Champ non rempli', "Vous devez renseigner votre adresse de facturation avant de valider votre inscription", "error");
                if (!document.getElementById('fact_zipcode').value) return swal('Champ non rempli', "Vous devez renseigner votre code postal de facturation avant de valider votre inscription", "error");
                if (!document.getElementById('fact_city').value) return swal('Champ non rempli', "Vous devez renseigner votre ville de facturation avant de valider votre inscription", "error");
            }

        }
        if (nbstep == 5) return go();
        stepContainer.className = "step" + nbstep;
    };

    const to = {};

    const changeFactAddress = elem => {
        const factElem = document.getElementById('fact_' + elem.id);
        if (!factElem) return;
        if (to[elem.id]) {
            clearTimeout(to[elem.id]);
            to[elem.id] = setTimeout(_ => factElem.value = elem.value, 1000);
            return;
        }
        if (factElem.value !== elem.value) return;
        to[elem.id] = setTimeout(_ => factElem.value = elem.value, 1000);
    }

    const changeCountry = elem => {
        const factCountry = document.getElementById('fact_country');
        if (factCountry.children[factCountry.selectedIndex].value != "France") return;
        for (let country of Array.from(factCountry.children)) {
            country.removeAttribute('selected');
        }
        factCountry.children[elem.selectedIndex].setAttribute('selected', 1);
    }

    const go = _ => {

        const country = document.getElementById('country');
        const factCountry = document.getElementById('fact_country');
        const civilities = Array.from(document.getElementById('civility').children);
        let civility = "Unknown";
        for (let civ of civilities) {
            if (civ.checked) {
                civility = civ.value;
                break;
            }
        }
        const request = {
            "name": document.getElementById('nom').value,
            "surname": document.getElementById('prenom').value,
            "civility": civility,
            "mail":  document.getElementById('email').value,
            "phone":  document.getElementById('phone').value,
            "offer": parseInt(selectedPlan.replace('plan-', '')),
            "entname": document.getElementById('etabname').value,
            "siret": document.getElementById('siret').value,
            "licence": document.getElementById('licence').value,
            "addr": document.getElementById('adresse').value,
            "cp": parseInt(document.getElementById('zipcode').value),
            "city": document.getElementById('city').value,
            "country": country.children[country.selectedIndex].value,
            "iban": document.getElementById('iban').value,
            "name_iban": document.getElementById('fact_nom').value,
            "fact_addr": document.getElementById('fact_adresse').value,
            "fact_cp": parseInt(document.getElementById('fact_zipcode').value),
            "fact_city": document.getElementById('fact_city').value,
            "fact_country": factCountry.children[factCountry.selectedIndex].value
        };
        console.log(request);
        app.services.http().post("/subscribe", request)
            .then(_ => swal('Inscription réussie', "Votre inscription a bien été prise en compte. Vous allez recevoir dans quelques instants un email vous permettant de confirmer l'inscription et de créer votre accès à la plateforme.", "success"))
            .then(_ => app.router.resolve('/login'))
            .catch(e => { console.error(e); swal('Erreur du serveur', "Une erreur s'est produite. Merci de vérifier vos différents champs.", "error");})
    };



    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy,
        step: step,
        choosePlan: choosePlan,
        changeFactAddress: changeFactAddress,
        changeCountry: changeCountry,
        go: go

    }

};