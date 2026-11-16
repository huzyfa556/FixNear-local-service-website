// Workers page: register hue workers ke card banata hai + service ke hisab se filter
(function () {
    var KEY = 'fixnearWorkers';
    var grid = document.getElementById('workers-grid');
    var buttons = document.querySelectorAll('.filter-btn');
    var empty = document.getElementById('no-results');

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    // Register hue workers ke cards (naye pehle)
    function renderSaved() {
        if (!grid) return;
        var list = [];
        try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { list = []; }
        list.slice().reverse().forEach(function (w) {
            var card = el('div', 'worker-card');
            card.setAttribute('data-type', w.service);

            if (w.photo) {
                var img = el('img');
                img.src = w.photo;
                img.alt = w.name;
                card.appendChild(img);
            } else {
                card.appendChild(el('div', 'worker-avatar', (w.name || '?').charAt(0).toUpperCase()));
            }
            card.appendChild(el('h2', '', w.name));
            card.appendChild(el('span', 'badge-type', w.service));
            card.appendChild(el('p', 'meta', '★ New · ' + w.exp + ' year' + (w.exp == 1 ? '' : 's') + ' experience'));
            card.appendChild(el('p', 'meta', '📍 ' + w.location));
            card.appendChild(el('p', 'status available', '● Available now'));

            var btn = el('button', 'button', 'Request Worker');
            btn.type = 'button';
            btn.addEventListener('click', function () {
                window.location.href = 'request.html?worker=' + encodeURIComponent(w.name) + '&service=' + encodeURIComponent(w.service) + (w.id ? '&wid=' + encodeURIComponent(w.id) : '');
            });
            card.appendChild(btn);
            grid.insertBefore(card, grid.firstChild);
        });
    }

    function apply(type) {
        var cards = document.querySelectorAll('.worker-card');
        var shown = 0;
        for (var i = 0; i < cards.length; i++) {
            var match = type === 'all' || cards[i].getAttribute('data-type') === type;
            cards[i].hidden = !match;
            if (match) shown++;
        }
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.toggle('active', buttons[j].getAttribute('data-filter') === type);
        }
        if (empty) empty.hidden = shown !== 0;
    }

    renderSaved();
    for (var k = 0; k < buttons.length; k++) {
        buttons[k].addEventListener('click', function () {
            apply(this.getAttribute('data-filter'));
        });
    }

    // Nav ke category menu se aaye (workers.html?service=Plumber) to wahi filter chalao
    var want = new URLSearchParams(location.search).get('service');
    if (want) {
        for (var m = 0; m < buttons.length; m++) {
            if (buttons[m].getAttribute('data-filter') === want) { apply(want); break; }
        }
    }
})();
