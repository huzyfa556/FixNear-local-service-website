// Dashboard: worker aur customer dono ke liye (page ke data-role se pata chalta hai)
(function () {
    var root = document.getElementById('dashboard');
    if (!root) return;
    var out = document.getElementById('dash-content');
    var role = root.getAttribute('data-role');           // 'worker' ya 'customer'
    var REQ = 'fixnearRequests';
    var A = window.FixAuth;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }
    function problem(msg) {
        out.appendChild(el('p', 'form-error dash-problem', msg));
    }

    if (!A) return problem('auth.js file is missing. Please put auth.js in the same folder.');

    // Login ke bina ya galat role ho to login page par bhejo
    var ses = A.getSession();
    if (!ses || ses.role !== role) {
        window.location.replace(role === 'worker' ? 'worker-login.html' : 'customer-login.html');
        return;
    }

    var me = null; // worker ka apna record
    if (role === 'worker') {
        var ws = A.load(A.WORKERS);
        for (var i = 0; i < ws.length; i++) if (ws[i].email === ses.email) me = ws[i];
        if (!me) return problem('Worker account not found. Please sign up again.');
    }

    var filter = 'all';
    var LABEL = { pending: 'Pending', accepted: 'Accepted', completed: 'Completed', declined: 'Declined', cancelled: 'Cancelled' };

    function loadAll() { return A.load(REQ); }
    function saveAll(list) { A.save(REQ, list); }

    function mine() {
        return loadAll().filter(function (r) {
            return role === 'worker' ? (me.id && r.workerId === me.id) : (r.customerEmail === ses.email);
        }).sort(function (a, b) { return b.time - a.time; });
    }

    function setStatus(id, status) {
        var list = loadAll();
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) { list[i].status = status; list[i].updated = Date.now(); }
        }
        saveAll(list);
        render();
    }

    function fmt(t) {
        try { return new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
        catch (e) { return new Date(t).toLocaleString(); }
    }

    function count(list, s) { return list.filter(function (r) { return r.status === s; }).length; }

    function statCard(num, label) {
        var c = el('div', 'stat-card');
        c.appendChild(el('div', 'stat-num', String(num)));
        c.appendChild(el('div', 'stat-label', label));
        return c;
    }

    function btn(text, cls, fn) {
        var b = el('button', cls, text);
        b.type = 'button';
        b.addEventListener('click', fn);
        return b;
    }

    function orderCard(r) {
        var card = el('div', 'order-card');
        var top = el('div', 'order-top');
        top.appendChild(el('h3', 'order-title', r.service || 'Service'));
        top.appendChild(el('span', 'badge-status ' + r.status, LABEL[r.status] || r.status));
        card.appendChild(top);

        if (role === 'worker') {
            card.appendChild(el('p', 'order-line', '👤 Customer: ' + r.name));
        } else {
            card.appendChild(el('p', 'order-line', '👷 Worker: ' + (r.worker || 'Any available worker')));
        }
        card.appendChild(el('p', 'order-line', '📍 ' + r.location));
        card.appendChild(el('p', 'order-msg', '“' + r.message + '”'));

        // Worker ko customer ka phone/email accept karne ke baad dikhta hai
        if (role === 'worker' && (r.status === 'accepted' || r.status === 'completed')) {
            var contact = el('p', 'order-line order-contact');
            var tel = el('a', '', '📞 ' + r.phone);
            tel.href = 'tel:' + r.phone;
            contact.appendChild(tel);
            contact.appendChild(document.createTextNode('  ·  ✉️ ' + r.email));
            card.appendChild(contact);
        }
        if (role === 'customer' && r.status === 'accepted') {
            card.appendChild(el('p', 'order-note', 'The worker accepted your request and will contact you soon.'));
        }
        card.appendChild(el('p', 'order-date', 'Requested: ' + fmt(r.time)));

        var actions = el('div', 'order-actions');
        if (role === 'worker') {
            if (r.status === 'pending') {
                actions.appendChild(btn('Accept', 'dash-btn', function () { setStatus(r.id, 'accepted'); }));
                actions.appendChild(btn('Decline', 'dash-btn alt', function () { setStatus(r.id, 'declined'); }));
            } else if (r.status === 'accepted') {
                actions.appendChild(btn('Mark as Completed', 'dash-btn', function () { setStatus(r.id, 'completed'); }));
            }
        } else if (r.status === 'pending') {
            actions.appendChild(btn('Cancel Request', 'dash-btn alt', function () { setStatus(r.id, 'cancelled'); }));
        }
        if (actions.childNodes.length) card.appendChild(actions);
        return card;
    }

    function render() {
        out.textContent = '';
        var all = mine();

        // Profile
        var prof = el('div', 'dash-profile');
        prof.appendChild(el('h2', '', 'Welcome, ' + ses.name + ' 👋'));
        var info = [];
        if (role === 'worker') {
            info.push(me.service, me.location, me.exp + ' yr' + (me.exp == 1 ? '' : 's') + ' experience');
        }
        info.push(ses.email, ses.phone);
        prof.appendChild(el('p', '', info.filter(Boolean).join('  ·  ')));
        out.appendChild(prof);

        // Stats
        var stats = el('div', 'dash-stats');
        stats.appendChild(statCard(all.length, 'Total Orders'));
        stats.appendChild(statCard(count(all, 'pending'), 'Pending'));
        stats.appendChild(statCard(count(all, 'accepted'), 'Accepted'));
        stats.appendChild(statCard(count(all, 'completed'), 'Completed'));
        out.appendChild(stats);

        // Tabs
        var tabs = el('div', 'filters dash-tabs');
        [['all', 'All Orders'], ['pending', 'Pending'], ['accepted', 'Accepted'], ['completed', 'Completed']].forEach(function (t) {
            var b = btn(t[1], 'filter-btn' + (filter === t[0] ? ' active' : ''), function () { filter = t[0]; render(); });
            tabs.appendChild(b);
        });
        out.appendChild(tabs);

        // Orders
        var shown = filter === 'all' ? all : all.filter(function (r) { return r.status === filter; });
        var list = el('div', 'order-list');
        if (!shown.length) {
            var empty = el('div', 'dash-empty');
            if (all.length === 0) {
                if (role === 'customer') {
                    empty.appendChild(el('p', '', 'You have no orders yet.'));
                    var a = el('a', 'form-card-btn', 'Find a Worker');
                    a.href = 'workers.html';
                    empty.appendChild(a);
                } else {
                    empty.appendChild(el('p', '', 'No requests yet. When a customer requests you, it will appear here.'));
                }
            } else {
                empty.appendChild(el('p', '', 'No ' + (LABEL[filter] || '').toLowerCase() + ' orders.'));
            }
            list.appendChild(empty);
        } else {
            shown.forEach(function (r) { list.appendChild(orderCard(r)); });
        }
        out.appendChild(list);
    }

    render();
    // Doosre tab me kuch badle to yahan bhi update ho jaye
    window.addEventListener('storage', function (e) { if (e.key === REQ) render(); });
})();
