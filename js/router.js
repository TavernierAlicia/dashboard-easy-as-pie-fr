window.app.routes = [
    {
        path: '', 
        ctrl: 'home',
        isAuth: true
    },{
        path: 'menu', 
        ctrl: 'menu',
        isAuth: true
    },{
        path: 'orders', 
        ctrl: 'orders',
        isAuth: true
    },{
        path: 'settings', 
        ctrl: 'settings',
        isAuth: true
    },{
        path: 'login',
        ctrl: 'login',
        isAuth: false
    },{
        path: 'sign-up',
        ctrl: 'signup',
        isAuth: false
    },{
        path: 'reset-pwd',
        ctrl: 'reset',
        isAuth: false
    },{
        path: 'bartender/:token',
        ctrl: 'bartender',
        isAuth: false
    },{
        path: 'pwd-create',
        ctrl: 'create',
        isAuth: false
    },{
        path: '(.*)', 
        ctrl: 'page404',
        isAuth: true
    }
];

window.app.loadRouter = _ => {

    const controllers = app.controllers;

    const options = {
        context: {
            user_token: _ => localStorage.getItem('user_token') || null,
            prev_ctrl: null,
            back: false,
            data: {}
        },
        baseUrl: '/',
        resolveRoute(context, params) {

            if (context.route.ctrl && controllers[context.route.ctrl]) {


                if (context.route.isAuth && !context.user_token()) return app.router.resolve('/login');
                if (!context.route.isAuth && context.user_token()) return app.router.resolve('/');

                if (context.prev_ctrl == context.route.ctrl) return;

                // Destroy previous controller
                if (app.current.destroy) {
                    app.current.destroy();
                }
                context.prev_ctrl = context.route.ctrl;
                
                // Update url
                if (context.pathname != window.location.pathname && !context.back) {
                    window.history.pushState({}, context.pathname, window.location.origin + context.pathname + window.location.search);
                }
                
                // Reinitialize back trigger
                context.back = false;

                document.body.className = context.route.ctrl;

                window.app.current = controllers[context.route.ctrl]();

                return app.current.init(context, params);
            }
            return undefined;
        },
        errorHandler(error, context) {}
    };
    
    window.app.router = new UniversalRouter(app.routes, options);
    app.router.resolve(location.pathname);

    window.onpopstate = ev => {
        app.router.resolve(ev.target.location.pathname, {back: true});
    };
}

window.onload = window.app.loadRouter;