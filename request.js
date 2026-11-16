// Request page: worker ko request bhejna (name, email, phone, location, message)
(function () {
    var KEY = 'fixnearRequests';
    var form = document.getElementById('request-form');
    if (!form) return;
    var err = document.getElementById('rq-error');
    var ok = document.getElementById('rq-success');
    var info = document.getElementById('request-for');

    // Kis worker ko request hai (workers page se link ke saath aata hai)
    var params = new URLSearchParams(location.search);
    var worker = (params.get('worker') || '').trim();
    var service = (params.get('service') || '').trim();
    var workerId = (params.get('wid') || '').trim();
    if (worker || service) {
        info.textContent = worker
            ? 'Requesting: ' + worker + (service ? ' (' + service + ')' : '')
            : 'Requesting a ' + service;
        info.hidden = false;
    }

    // Login customer ho to naam, email, phone pehle se bharo
    try {
        var ses = JSON.parse(localStorage.getItem('fixnearSession'));
        if (ses && ses.role === 'customer') {
            if (!form.name.value) form.name.value = ses.name || '';
            if (!form.email.value) form.email.value = ses.email || '';
            if (!form.phone.value) form.phone.value = ses.phone || '';
        }
    } catch (e) {}

    var dashLink = document.getElementById('rq-dash');
    function isCustomer() {
        try { var s = JSON.parse(localStorage.getItem('fixnearSession')); return !!(s && s.role === 'customer'); } catch (e) { return false; }
    }

    function fail(msg) {
        err.textContent = msg;
        err.hidden = false;
        ok.hidden = true;
        if (err.scrollIntoView) err.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = form.name.value.trim();
        var email = form.email.value.trim().toLowerCase();
        var phone = form.phone.value.replace(/[\s-]/g, '');
        var loc = form.location.value.trim();
        var msg = form.message.value.trim();

        if (name.length < 2) return fail('Please enter your name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email.');
        if (!/^\+?\d{10,13}$/.test(phone)) return fail('Please enter a valid phone number.');
        if (loc.length < 3) return fail('Please write your location.');
        if (msg.length < 5) return fail('Please write a short message.');

        var list = [];
        try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e1) { list = []; }
        // Login customer ho to uske account se jodo, warna jo email likhi wahi
        var custEmail = email;
        try {
            var s2 = JSON.parse(localStorage.getItem('fixnearSession'));
            if (s2 && s2.role === 'customer' && s2.email) custEmail = s2.email;
        } catch (e3) {}
        list.push({
            id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            status: 'pending',
            worker: worker, workerId: workerId, service: service,
            name: name, email: email, customerEmail: custEmail,
            phone: phone, location: loc, message: msg,
            time: Date.now(), updated: Date.now()
        });
        try {
            localStorage.setItem(KEY, JSON.stringify(list));
        } catch (e2) {
            return fail('Could not save. Please try again.');
        }

        err.hidden = true;
        form.reset();
        ok.hidden = false;
        if (dashLink && isCustomer()) dashLink.hidden = false;
        if (ok.scrollIntoView) ok.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
})();
