export default function login() {


    const init = (context, params) => {
        app.services.setTemplate('login.html');
        return true;
    };

    const toggleLoginForgot = _ => {

        document.getElementById('step').classList.toggle('login');
        document.getElementById('step').classList.toggle('forgot');

    }

    const login = _ => {

        const email = document.getElementById('email').value;
        if (!email) return swal("Email manquant", "Afin de vous connecter, vous devez renseigner votre identifiant", "error");
        const password = document.getElementById('password').value;
        if (!password) return swal("Mot de passe manquant", "Afin de vous connecter, vous devez renseigner votre mot de passe", "error");

        const encrypt =  CryptoJS.SHA256(password).toString();

        app.services.http().post("/connect", {mail: email, password: encrypt})
            .then(res => {
                if (!res || !res.token) return Promise.reject();
                localStorage.setItem('user_token', res.token);
                return app.router.resolve('/')
                console.log(res);
            })
            .catch(_ => swal("Erreur de connexion", "Vos identifiants semblent incorrets. Veuillez réessayer ou utiliser l'option mot de passe oublié.", "error"))
        ;
        
    };
    
    const forgot = _ => {
        
        const email = document.getElementById('forgot-email').value;
        if (!email) return swal("Email manquant", "Afin de réinitialiser votre mot de passe, vous devez renseigner votre email", "error");

        app.services.http().post("/sendMail4reset-pwd", {mail: email})
            // Pour éviter un scrap des emails de nos clients, on ne dit pas si le mail de réinitialisation a échoué ou non.
            .catch(_ => {})
            .finally(_ => 
                swal("Demande envoyé", "Si votre email est correcte, vous recevrez dans les prochaines minutes un mail afin de réinitialiser votre mot de passe.", "success")
                .then(_ => location.reload(true))
            )
        ;

    }

    const destroy = _ => {

    };

    return {
        init:               init,
        toggleLoginForgot:  toggleLoginForgot,
        login:              login,
        forgot:             forgot,
        destroy:            destroy
    }

};