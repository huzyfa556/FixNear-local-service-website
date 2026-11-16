// Mobile nav: arrow dabane par pages ki list khulti / band hoti hai
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    function setOpen(open) {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
        setOpen(!links.classList.contains('open'));
    });

    // Bahar click ya Escape par menu band
    document.addEventListener('click', function (e) {
        if (!links.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });

    // Current page ko highlight karo
    var page = location.pathname.split('/').pop() || 'home.html';
    // login / signup se judey sab pages par "Sign Up / Login" highlight
    if (page === 'worker-login.html' || page === 'customer-login.html' || page === 'register.html') page = 'account.html';
    if (page === 'request.html') page = 'workers.html'; // request page nav me nahi, par Workers highlight rahe
    var anchors = links.querySelectorAll('a');
    for (var i = 0; i < anchors.length; i++) {
        if (anchors[i].getAttribute('href') === page) {
            anchors[i].classList.add('active');
            anchors[i].setAttribute('aria-current', 'page');
        }
    }

    // Login ho chuka ho to "Login" ki jagah "Logout (naam)" dikhao
    var ses = null;
    try { ses = JSON.parse(localStorage.getItem('fixnearSession')); } catch (e) {}
    var loginLink = links.querySelector('a[href="account.html"]');
    if (ses && ses.name && loginLink) {
        // "Dashboard" link (worker ya customer ke hisab se)
        var dash = document.createElement('a');
        dash.textContent = 'Dashboard';
        dash.href = ses.role === 'worker' ? 'worker-dashboard.html' : 'customer-dashboard.html';
        if (page === dash.getAttribute('href')) {
            dash.classList.add('active');
            dash.setAttribute('aria-current', 'page');
        }
        loginLink.parentNode.insertBefore(dash, loginLink);
        loginLink.textContent = 'Logout (' + String(ses.name).split(' ')[0] + ')';
        loginLink.classList.remove('active');
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            try { localStorage.removeItem('fixnearSession'); } catch (e2) {}
            window.location.href = 'account.html';
        });
    }

    // Category se aaye hon to us category ka link bhi highlight karo
    var cat = new URLSearchParams(location.search).get('service');
    if (cat && (location.pathname.split('/').pop() === 'workers.html')) {
        var subs = links.querySelectorAll('.nav-submenu a');
        for (var s = 0; s < subs.length; s++) {
            if (decodeURIComponent(subs[s].getAttribute('href').split('service=')[1] || '') === cat) {
                subs[s].classList.add('active');
            }
        }
    }
})();
