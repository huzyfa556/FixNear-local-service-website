// Customer: login + naya account
(function () {
    var A = window.FixAuth;
    var loginForm = document.getElementById('cust-login-form');
    var signupForm = document.getElementById('cust-signup-form');
    if (!loginForm || !signupForm) return;

    var tabs = document.querySelectorAll('.auth-switch button');
    var title = document.getElementById('auth-title');

    function show(mode) {
        var isLogin = mode === 'login';
        loginForm.hidden = !isLogin;
        signupForm.hidden = isLogin;
        title.textContent = isLogin ? 'Customer Login' : 'Create Customer Account';
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle('active', tabs[i].getAttribute('data-mode') === mode);
        }
    }
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () { show(this.getAttribute('data-mode')); });
    }
    function fromHash() { show(location.hash === '#signup' ? 'signup' : 'login'); }
    if (location.hash === '#signup') show('signup');
    window.addEventListener('hashchange', fromHash);

    function fail(id, msg) {
        var e = document.getElementById(id);
        e.textContent = msg; e.hidden = false;
    }
    function done(id, msg, name, phone) {
        var s = document.getElementById(id);
        document.getElementById(id.replace('ok', 'err')).hidden = true;
        s.textContent = msg; s.hidden = false;
        A.setSession('customer', name, phone);
        setTimeout(function () { window.location.href = 'workers.html'; }, 900);
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var phone = A.phone(loginForm.phone.value);
        var pw = loginForm.password.value;
        if (!A.validPhone(phone)) return fail('login-err', 'Please enter a valid phone number.');
        if (!pw) return fail('login-err', 'Please enter your password.');
        A.hash(pw).then(function (h) {
            var list = A.load(A.CUSTOMERS), user = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i].phone === phone && list[i].passHash === h) user = list[i];
            }
            if (!user) return fail('login-err', 'Wrong phone number or password.');
            done('login-ok', '✓ Login successful! Taking you to workers...', user.name, user.phone);
        });
    });

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = signupForm.name.value.trim();
        var phone = A.phone(signupForm.phone.value);
        var pw = signupForm.password.value;
        if (name.length < 2) return fail('signup-err', 'Please enter your name.');
        if (!A.validPhone(phone)) return fail('signup-err', 'Please enter a valid phone number.');
        if (pw.length < 6) return fail('signup-err', 'Password must be at least 6 characters.');
        if (pw !== signupForm.confirm.value) return fail('signup-err', 'Passwords do not match.');
        var list = A.load(A.CUSTOMERS);
        for (var i = 0; i < list.length; i++) {
            if (list[i].phone === phone) return fail('signup-err', 'This phone number already has an account. Please login.');
        }
        A.hash(pw).then(function (h) {
            list.push({ name: name, phone: phone, passHash: h, time: Date.now() });
            if (!A.save(A.CUSTOMERS, list)) return fail('signup-err', 'Could not save. Please try again.');
            done('signup-ok', '✓ Account created! Taking you to workers...', name, phone);
        });
    });
})();