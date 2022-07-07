import login        from '/js/controllers/login.js';
import home         from '/js/controllers/home.js';
import page404      from '/js/controllers/page404.js';
import signup       from '/js/controllers/signup.js';
import reset        from '/js/controllers/reset.js';
import create       from '/js/controllers/create.js';
import menu         from '/js/controllers/menu.js';
import settings     from '/js/controllers/settings.js';
import orders       from '/js/controllers/orders.js';
import bartender    from '/js/controllers/bartender.js';

window.app.current = {};

window.app.controllers = {
    login:      login,
    home:       home,
    page404:    page404,
    signup:     signup,
    reset:      reset,
    create:     create,
    menu:       menu,
    orders:     orders,
    settings:   settings,
    bartender:  bartender
};


