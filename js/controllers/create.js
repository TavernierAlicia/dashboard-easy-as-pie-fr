export default function create() {

    let token = null;

    const init = context => {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('token'))  return app.router.resolve('/login');
        token = urlParams.get('token');
        for (let p of urlParams.keys()) urlParams.delete(p);
        window.history.replaceState({}, document.title, "/create");
        app.services.setTemplate('create.html');
        return true;
    };

    const destroy = _ => {

    };

    const create = _ => {
        const pwd1 = document.getElementById('pwd1').value;
        const pwd2 = document.getElementById('pwd2').value;
        if (!pwd1 || !pwd2) return swal("Mot de passe manquant", "Afin de vous réinitialiser votre mot de passe, vous devez renseigner tous les champs", "error");
        if (pwd1 !== pwd2) return swal("Mot de passe incorrect", "Les mots de passe ne sont pas identique. Merci de vérifier vos champs.", "error");

        app.services.http().post("/pwd-create", {token: token, password:  CryptoJS.SHA256(pwd1).toString(), "password-confirm": CryptoJS.SHA256(pwd2).toString()})
            .then(_ => swal('Inscription terminée', "Votre compte est a présent opérationnel. Vous pouvez désormais vous connecter grâce à votre adresse mail et au mot de passe que vous venez de créer.", "success")
                .then(_ => app.router.resolve('/login'))
            )
            .catch(_ => swal("Une erreur est survenue", "Veuillez réessayer plus tard", "error"))
        ;
    };


    return {
        init: init,
        destroy: destroy,
        create: create
    }

}
