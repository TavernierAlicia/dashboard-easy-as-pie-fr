export default function settings() {

    let currentTab = "";

    
    const defaultPlanning = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    };
    
    let planning = null;

    const planningDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let planning_exist = 0;

    const init = (context, params) => {
        app.services.setTemplate('settings.html')
            .then(_ => app.services.setHeader())
            ;
        return true;
    };

    const changeTab = event => {
        let tab = event.currentTarget.parentNode.id;
        if (tab === currentTab) tab = "";
        currentTab = tab;
        switch (currentTab) {
            case 'etablissement':
                getEtab();
                break;
            case 'account':
                getAccount();
                break;
            case 'payment':
                getPayment();
                break;
            case 'offer':
                getOffer();
                break;
            case 'qrcode':
                getQRCode();
            default:
                break;
        }

    };

    const getEtab = _ => {
        return app.services.http(true).get('/etab-params')
            .then(res => {
                document.getElementById('etab-addr').value = res.Addr;
                document.getElementById('etab-city').value = res.City;
                document.getElementById('etab-country').value = res.Country;
                document.getElementById('etab-cp').value = res.Cp;
                document.getElementById('etab-name').value = res.Etab_name;
                document.getElementById('etab-fb').value = res.Facebook;
                document.getElementById('etab-insta').value = res.Insta;
                document.getElementById('etab-twitter').value = res.Twitter;
                document.getElementById('etab-lic').value = res.License;
                document.getElementById('etab-phone').value = res.Phone;
                document.getElementById('etab-siret').value = res.Siret;
                document.getElementById('etab-picture').src = res.Pic;

                planning = JSON.parse(JSON.stringify(defaultPlanning));
                for (let plage of res.Horaires) {
                    planning[planningDays[plage.Day]].push({start: plage.Start, end: plage.End > 1440 ? 1440 : plage.End, isHH: plage.Is_HH});
                }
                new userplanning(planning, document.getElementById('theplanning'))
            })
        ;
    };

    const saveEtab = _ => {
        const data = {
            Addr:    document.getElementById('etab-addr').value,
            City:    document.getElementById('etab-city').value,
            Country:    document.getElementById('etab-country').value,
            Cp:    parseInt(document.getElementById('etab-cp').value),
            Etab_name:    document.getElementById('etab-name').value,
            Facebook:    document.getElementById('etab-fb').value,
            Insta:    document.getElementById('etab-insta').value,
            Twitter:    document.getElementById('etab-twitter').value,
            License:    document.getElementById('etab-lic').value,
            Phone:    document.getElementById('etab-phone').value,
            Siret:    document.getElementById('etab-siret').value,
            Pic:   document.getElementById('etab-picture').src,
            Horaires: []
        };


        if (!data.Addr || !data.City || !data.Country || !data.Cp) {
            return swal('Champ obligatoire', "Vous devez obligatoirement renseigner une adresse complète pour votre établissement", "error");
        }
        if (!data.Phone) return swal('Champ obligatoire', "Vous devez obligatoirement renseigner un numéro de téléphone", "error");
        if (!data.Etab_name) return swal('Champ obligatoire', "Vous devez obligatoirement renseigner un nom pour votre établissement", "error");

        for (let d in planning) {
            let day = planningDays.findIndex(pd => pd == d);
            for (let p of planning[d]) {
                data.Horaires.push({Day: day, Start: p.start, End: p.end, Is_Active: true, Is_HH: p.isHH});
            }
        }
        return app.services.http(true).put('/etab-params', data)
            .then(res => swal('Mise à jour', "Vos informations d'établissement ont bien été mises à jour", "success"));
        ;
    };

    const getAccount = _ => {
        return app.services.http(true).get('/profile')
            .then(res => {
                const civility = document.querySelectorAll('#account #civility input');
                for (let civ of civility) {
                    if (civ.value == res.Civility) {
                        civ.checked = true;
                        break;
                    }
                }
                document.querySelector('#account #fname').value = res.Name;
                document.querySelector('#account #lname').value = res.Surname;
                document.querySelector('#account #email').value = res.Mail;
            })
        ;
    };

    const saveAccount = _ => {
        const data = {
            Civility: document.querySelector("#account #civility input:checked").value,
            Name: document.querySelector('#account #fname').value,
            Surname: document.querySelector('#account #lname').value,
            Mail: document.querySelector('#account #email').value
        }

        if (!data.Name || !data.Surname) return swal('Champ obligatoire', "Vous devez obligatoirement renseigner un nom et un prénom pour continuer", "error");
        if (!data.Mail) return swal('Champ obligatoire', "Vous devez obligatoirement renseigner une adresse email pour continuer", "error");
        return app.services.http(true).put('/profile', data)
            .then(res => swal('Mise à jour', "Vos informations personnelles ont bien été mises à jour", "success"));
        ;
    };

    const getPayment = _ => {
        return app.services.http(true).get('/payment-method')
            .then(res => {
                document.querySelector("#payment #addf").value = res.Fact_addr
                document.querySelector("#payment #villef").value = res.Fact_city
                document.querySelector("#payment #payf").value = res.Fact_country
                document.querySelector("#payment #pcode").value = res.Fact_cp
                document.querySelector("#payment #iban").value = res.Iban
                document.querySelector("#payment #niban").value = res.Name_iban
            })
            ;
    };

    const savePayment = _ => {
        const data = {
            Fact_addr: document.querySelector("#payment #addf").value,
            Fact_city: document.querySelector("#payment #villef").value,
            Fact_country: document.querySelector("#payment #payf").value,
            Fact_cp: parseInt(document.querySelector("#payment #pcode").value),
            Iban: document.querySelector("#payment #iban").value,
            Name_iban: document.querySelector("#payment #niban").value
        }

        for (let d in data) {
            if (!data[d]) return swal('Champ obligatoire', "Vous devez obligatoirement renseigner tous les champs pour la partie facturation", "error");
        }

        return app.services.http(true).put('/payment-method', data)
            .then(res => swal('Mise à jour', "Vos informations de facturation ont bien été mises à jour", "success"));
    };

    const getOffer = _ => {
        return app.services.http(true).get('/offers')
            .then(res => {
                document.getElementById('offer-name').textContent = res.Name
            })
            ;
    }

    const getQRCode = _ => {
        return app.services.http(true).get('/get-qrs')
            .then(res => {
                document.getElementById('qr_serveurs').src = res.qr1;
                document.getElementById('qr_clients').src = res.qr0;
            });
    }

    const sendNewPP = elem => {
        if(!elem.files[0]) return;
        var data = new FormData()
        data.append('pic', elem.files[0]);
        fetch('http://api.easy-as-pie.fr/update-pic', {
            method: 'PUT',
            headers: {
                "Authorization": localStorage.getItem('user_token'),
            },
            body: data
        })
        .then(res => res.status >= 400 ? Promise.reject() : res.json())
        .then(res => document.getElementById('etab-picture').src = res)
        .then(_ => swal("Mise à jour", "Votre photo d'établissement a bien été mise à jour", "success"))
        .catch(err => swal("Mise à jour échouée", "Votre photo d'établissement n'a pas pu etre mise à jour. Merci de réessayer plus tard.", "error"));
    };



    /*===========================================
    RINGOVER PLANNING
    ===========================================*/
    let eventsListenersList = [];

    let planning_days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    let userplanning = function (plan, clip,) {
        // variables de base
        let self = {
            'deplace': false,
            'plan': plan,
            'container': clip,
            'cursor': {},
            'planwidth': clip.offsetWidth,
            'slotminwidth': 60,
            'slotspacing': 0,
            'notch': 15,
            'jours': planningDays
        };

        // lancement du planning et des events
        var user_launching = function () {
            if (planning_exist) {
                user_create_planning();
            } else {
                planning_exist = 1;
                removeEvent(self.container, 'mousedown', user_planning_down);
                removeEvent(self.container, 'mousemove', user_planning_move);
                removeEvent(document, 'mouseup', user_planning_up);
                // removeEvent(self.container, 'dblclick', user_planning_dblclick);
                // if (document.getElementById('apply_week')) removeEvent(document.getElementById('apply_week'), 'click', user_recurence);
                removeEvent(document, 'touchstart', user_detect_touch_start);
                removeEvent(document, 'touchend', user_planning_up);
                removeEvent(document, 'touchmove', user_planning_move);
                user_create_planning();
                addEvent(self.container, 'mousedown', user_planning_down, false);
                addEvent(self.container, 'mousemove', user_planning_move, false);
                addEvent(document, 'mouseup', user_planning_up, false);
                addEvent(document, 'contextmenu', user_planning_rightclick, false);
                // addEvent(self.container, 'dblclick', user_planning_dblclick,false);
                // if (document.getElementById('apply_week')) addEvent(document.getElementById('apply_week'), 'click', user_recurence, false);
                addEvent(document, 'touchstart', user_detect_touch_start, false);
                addEvent(document, 'touchend', user_planning_up, false);
                addEvent(document, 'touchmove', user_planning_move, false);
            }
        };

        // utilitaires
        var min2px = function (data) {
            return data * self.planwidth / 1440;
        };
        var px2min = function (data) {
            return Math.round(data * 1440 / self.planwidth);
        };
        var min2pourcent = function (data) {
            return data * 100 / 1440;
        };
        var pourcent2min = function (data) {
            return Math.round(data * 1440 / 100);
        };
        var get_heure = function (pos) {
            var v = Math.round(px2min(pos) / self.notch) * self.notch;
            var heure = Math.floor(v / 60);
            var minute = v % 60;
            if (minute == 0) minute = '00';
            if (minute == 5) minute = '05';
            return heure + 'h' + minute;
        };

        // création HTML du planning + légende
        var user_create_planning = function () {
            var html = '';
            var isnew = false;
            for (var jour = 0; jour < 7; jour++) {
                html += '<div class="planning" id="planning' + jour + '" data-jour="' + jour + '">';
                html += '<p>' + planning_days[jour] + '</p>';
                for (var i = 0; i < self.plan[self.jours[jour]].length; i++) {
                    var l = min2px(self.plan[self.jours[jour]][i].start);
                    var w = min2px(self.plan[self.jours[jour]][i].end - self.plan[self.jours[jour]][i].start);
                    var c = 'plage';
                    var h = self.plan[self.jours[jour]][i].isHH ? "1" : "0";
                    if (self.plan[self.jours[jour]][i].isnew) {
                        c += ' isnew';
                        delete self.plan[self.jours[jour]][i].isnew;
                        isnew = 'plage' + jour + '' + i;
                    }
                    html += '<div class="' + c + '" id="plage' + jour + '' + i + '" style="left:' + l + 'px;width:' + w + 'px;" data-hh="' + h + '" data-jour="' + jour + '" data-index="' + i + '">';
                    html += '<span class="cursor_start"><strong>' + get_heure(l) + '</strong></span>';
                    html += '<span class="cursor_end"><strong>' + get_heure(l + w) + '</strong></span>';
                    html += '</div>';
                }
                html += '</div>';
            }
            self.container.innerHTML = html;
            if (isnew !== false) {
                setTimeout(function () {
                    document.getElementById(isnew).classList.remove('isnew');
                }, 20);
            }
        };



        var holdPlage = false;

        var user_detect_touch_start = function (event) {
            var target = event.target || event.srcElement;
            if (target.className == 'plage') {
                if (holdPlage) {
                    holdPlage = false;
                    user_planning_dblclick(event);
                } else {
                    holdPlage = true;
                }
            } else if (target.className == 'planning') {
                if (holdPlage) {
                    holdPlage = false;
                    user_planning_dblclick(event);
                } else {
                    holdPlage = true;
                }
            } else {
                user_planning_down(event);
            }
        };

        // gestion des curseurs
        function user_planning_down(event) {
            if (event.button > 0) {
                return;
            }
            var target = event.target;
            if (target.classList.contains('cursor_start') || target.classList.contains('cursor_end')) {
                event.returnValue = false;
                if (event.preventDefault) event.preventDefault();
                self.deplace = true;
                var type = 'start';
                if (target.className == 'cursor_end') {
                    type = 'end';
                }
                var clipjourCoord = getpos(target.parentNode.parentNode);
                var cursorCoord = getpos(target);
                var mouse = get_pos_mouse(event);
                self.cursor = {
                    'clip': target,
                    'plage': target.parentNode,
                    'clipjourx': clipjourCoord.left,
                    'initx': target.parentNode.offsetLeft,
                    'initw': target.parentNode.offsetWidth,
                    'type': type,
                    'index': parseInt(target.parentNode.getAttribute('data-index')),
                    'jour': parseInt(target.parentNode.parentNode.getAttribute('data-jour')),
                    'diff': mouse.x - cursorCoord.left,
                };

                // on active la plage
                self.cursor.plage.classList.add('active');

                // calcul des limites
                var limit_start = 0;
                var limit_end = self.planwidth;
                if (type == 'start') {
                    limit_end = min2px(parseInt(self.plan[self.jours[self.cursor.jour]][self.cursor.index].end) - parseInt(self.slotminwidth));
                    if (self.cursor.index > 0) {
                        limit_start = min2px(parseInt(self.plan[self.jours[self.cursor.jour]][self.cursor.index - 1].end));
                    }
                }
                if (type == 'end') {
                    limit_start = min2px(parseInt(self.plan[self.jours[self.cursor.jour]][self.cursor.index].start) + parseInt(self.slotminwidth));
                    if (self.cursor.index < self.plan[self.jours[self.cursor.jour]].length - 1) {
                        limit_end = min2px(parseInt(self.plan[self.jours[self.cursor.jour]][self.cursor.index + 1].start));
                    }
                }
                self.cursor.limit_start = limit_start;
                self.cursor.limit_end = limit_end;
            } else if (target.className == 'plage' || target.className == 'planning') {
                if (holdPlage) {
                    holdPlage = false;
                    user_planning_dblclick(event);
                } else {
                    holdPlage = true;
                    setTimeout(function () { holdPlage = false; }, 300);
                }
            }
        }
        function user_planning_move(event) {
            if (self.deplace) {

                var mouse = get_pos_mouse(event);

                // position du curseur
                var pos;
                if (self.cursor.type == 'start') pos = Math.round(mouse.x - self.cursor.clipjourx);

                if (self.cursor.type == 'end') {
                    pos = Math.round(mouse.x - self.cursor.clipjourx);
                }

                if (self.cursor.type == 'start') {
                    pos -= self.cursor.diff;
                } else {
                    pos += self.cursor.diff;
                }

                if (pos <= self.cursor.limit_start) {
                    pos = self.cursor.limit_start;
                }
                if (pos >= self.cursor.limit_end) {
                    pos = self.cursor.limit_end;
                }

                // on crante
                pos = Math.round(pos / min2px(self.notch)) * min2px(self.notch);

                // calcul de l'heure
                var h = get_heure(pos);

                // position de la plage+largeur
                var width = null;
                var left = null;
                if (self.cursor.type == 'start') {
                    left = pos;
                    width = self.cursor.initw + self.cursor.initx - left;
                } else {
                    width = pos - self.cursor.initx;
                    left = pos - width;
                }

                // puis on assigne les valeurs
                self.cursor.plage.style.left = left + 'px';
                self.cursor.plage.style.width = width + 'px';
                self.cursor.clip.children[0].innerHTML = h;
            }
        }
        function user_planning_up() {
            if (self.deplace) {
                self.deplace = false;
                self.cursor.plage.classList.remove('active');
                user_planning_edit();
            }
        }
        function user_planning_dblclick(event) {
            if (event.target.className == 'planning') {
                user_add_plage(event);
            } else if (event.target.className == 'plage') {
                user_destroy_plage(event);
            }
        }

        function user_planning_rightclick(event) {
            if (event.target.className == 'plage') {
                event.preventDefault();
                user_set_strongplage(event);
            }
        }

        // éditer l'objet planning
        var user_planning_edit = function () {
            var plage = document.getElementById('plage' + self.cursor.jour + '' + self.cursor.index);
            var l = plage.offsetLeft;
            var w = plage.offsetWidth;

            self.plan[self.jours[self.cursor.jour]][self.cursor.index].start = Math.round(px2min(l) / self.notch) * self.notch;
            self.plan[self.jours[self.cursor.jour]][self.cursor.index].end = Math.round(px2min(l + w) / self.notch) * self.notch;

            planning = self.plan;
        };

        var user_set_strongplage = function(event) {
            var plage = event.target;
            var jour = plage.parentNode.getAttribute('data-jour');
            var index = plage.getAttribute('data-index');
            let hasHH = false;
            for (let p of self.plan[self.jours[jour]]) if (p.isHH) hasHH = true;
            if (hasHH && !self.plan[self.jours[jour]][index].isHH) return swal('Planning surchargé', "Vous ne pouvez mettre qu'une tranche d'Happy Hour par jour", "error");
            self.plan[self.jours[jour]][index].isHH = !self.plan[self.jours[jour]][index].isHH;
            event.target.dataset.hh = self.plan[self.jours[jour]][index].isHH  ? "1" : "0";
            planning = self.plan;
        }

        // ajouter une plage
        var user_add_plage = function (event) {

            var clipjour = event.target;
            var jour = clipjour.getAttribute('data-jour');
            if (self.plan[self.jours[jour]].length == 5) {
                return swal("Planning surchargé", "Vous ne pouvez avoir que 5 tranches d'ouverture par jour dans votre planning", "error")
            }
            var mouse = get_pos_mouse(event);
            var clipjourCoord = getpos(clipjour);
            var t = px2min(mouse.x - clipjourCoord.left);
            var t_start = 0;
            var t_end = 1440;
            var index = 0;
            for (var i = 0; i < self.plan[self.jours[jour]].length; i++) {
                if (t < self.plan[self.jours[jour]][i].start) {
                    t_end = self.plan[self.jours[jour]][i].start;
                    if (i > 0) {
                        t_start = self.plan[self.jours[jour]][i - 1].end;
                    }
                    index = i;
                    break;
                }
                if (t > self.plan[self.jours[jour]][i].end) {
                    t_start = self.plan[self.jours[jour]][i].end;
                    index = 'end';

                }
            }
            var newplan = { 'start': t_start, 'end': t_end, 'isnew': true, isHH: false };
            if (index == 'end') {
                self.plan[self.jours[jour]].push(newplan);
            } else {
                self.plan[self.jours[jour]].splice(index, 0, newplan);
            }
            planning = self.plan;
            user_create_planning();
        };

        // supprimer une plage
        var user_destroy_plage = function (event) {
            var plage = event.target;
            var jour = plage.parentNode.getAttribute('data-jour');
            var index = plage.getAttribute('data-index');
            self.plan[self.jours[jour]].splice(index, 1);
            planning = self.plan;
            user_create_planning();
        };

        // appliquer le lundi à toute la semaine
        function user_recurence() {
            for (let jour = 1; jour < 7; jour++) {
                self.plan[self.jours[jour]] = [];
            }
            for (var plage = 0; plage < self.plan[0].length; plage++) {
                var start = self.plan[0][plage].start;
                var end = self.plan[0][plage].end;
                for (let jour = 0; jour < 7; jour++) {
                    self.plan[self.jours[jour]][plage] = { 'start': start, 'end': end };
                }
            }
            planning = self.plan;
            user_create_planning();
        }

        user_launching();
    };

    function addEvent(obj, trigger, fct, capturing, passive = false) {
        var fct_name = functionName(fct);
        for (var i = 0; i < eventsListenersList.length; i++) {
            if (obj == eventsListenersList[i].obj && trigger == eventsListenersList[i].trigger && fct_name == eventsListenersList[i].fct) {
                return;
            }
        }
        obj.addEventListener(trigger, fct, { capture: capturing, passive: passive });

        eventsListenersList.push({
            'obj': obj,
            'trigger': trigger,
            'fct': fct_name,
            'fctfn': fct
        });
    }
    function removeEvent(obj, trigger, fct) {
        if (obj && obj.removeEventListener && trigger && fct) obj.removeEventListener(trigger, fct);
        for (var i = 0; i < eventsListenersList.length; i++) {
            if (obj == eventsListenersList[i].obj && trigger == eventsListenersList[i].trigger) {
                eventsListenersList.splice(i, 1);
                continue;
            }
        }
    }

    function functionName(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }

    function get_pos_mouse(e) {
		var posx,posy;
		
		if(e.type=='touchstart' || e.type=='touchmove') {
			var touchList = e.changedTouches;
			return {'x':touchList[0].pageX,'y':touchList[0].screenY};
			
		}
		
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		} else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return {'x':posx,'y':posy};
	}
	function getpos(element) {
		var rect = element.getBoundingClientRect(), bodyElt = document.body;
		return {
			top: Math.round(rect.top + bodyElt .scrollTop),
			left: Math.round(rect.left + bodyElt .scrollLeft)
		};
	}


    //////////////////////////////////////////////////////////////////////




    const destroy = _ => {

    };

    return {
        init: init,
        destroy: destroy,

        saveEtab: saveEtab,
        saveAccount: saveAccount,
        savePayment: savePayment,
        sendNewPP: sendNewPP,

        changeTab: changeTab,

    }

};