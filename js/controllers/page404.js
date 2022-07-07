export default function page404() {


    const init = context => {

        console.log(1, context);
        return true;
    };

    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy

    }

};