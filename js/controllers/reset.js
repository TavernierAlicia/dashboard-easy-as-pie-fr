export default function reset() {


    let token = null;

    const init = (context, params) => {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('token'))  return app.router.resolve('/login');
        token = urlParams.get('token');
        for (let p of urlParams.keys()) urlParams.delete(p);
        app.services.setTemplate('reset.html');
        return true;
    };

    const reset = _ => {
        const pwd1 = document.getElementById('pwd1').value;
        const pwd2 = document.getElementById('pwd2').value;
        if (!pwd1 || !pwd2) return swal("Mot de passe manquant", "Afin de vous réinitialiser votre mot de passe, vous devez renseigner tous les champs", "error");
        if (pwd1 !== pwd2) return swal("Mot de passe incorrect", "Les mots de passe ne sont pas identique. Merci de vérifier vos champs.", "error");
        console.log(token);


    }

    const destroy = _ => {


    };

    return {
        init: init,
        reset: reset,
        destroy: destroy

    }

};