// Customer: login (email + password) aur naya account (email + phone + password)
(function () {
    var A = window.FixAuth;
    var loginForm = document.getElementById('cust-login-form');
    var signupForm = document.getElementById('cust-signup-form');
    if (!loginForm || !signupForm) return;

    if (!A) {
        var box = document.getElementById('login-err');
        box.textContent = 'auth.js file is missing. Please put auth.js in the same folder.';
        box.hidden = false;
        return;
    }

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
    function done(id, msg, name, email, phone) {
        var s = document.getElementById(id);
        document.getElementById(id.replace('ok', 'err')).hidden = true;
        s.textContent = msg; s.hidden = false;
        A.setSession('customer', name, email, phone);
        setTimeout(function () { window.location.href = 'customer-dashboard.html'; }, 900);
    }
    function nameFrom(email) { return email.split('@')[0]; }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = A.email(loginForm.email.value);
        var pw = loginForm.password.value;
        if (!A.validEmail(email)) return fail('login-err', 'Please enter a valid email.');
        if (!pw) return fail('login-err', 'Please enter your password.');
        A.hash(pw).then(function (h) {
            var list = A.load(A.CUSTOMERS), user = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i].email === email && list[i].passHash === h) user = list[i];
            }
            if (!user) return fail('login-err', 'Wrong email or password.');
            done('login-ok', '✓ Login successful! Opening your dashboard...', user.name || nameFrom(user.email), user.email, user.phone);
        });
    });

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = A.email(signupForm.email.value);
        var phone = A.phone(signupForm.phone.value);
        var pw = signupForm.password.value;
        if (!A.validEmail(email)) return fail('signup-err', 'Please enter a valid email.');
        if (!A.validPhone(phone)) return fail('signup-err', 'Please enter a valid phone number.');
        if (pw.length < 6) return fail('signup-err', 'Password must be at least 6 characters.');
        var list = A.load(A.CUSTOMERS);
        for (var i = 0; i < list.length; i++) {
            if (list[i].email === email) return fail('signup-err', 'This email already has an account. Please login.');
            if (list[i].phone === phone) return fail('signup-err', 'This phone number already has an account. Please login.');
        }
        A.hash(pw).then(function (h) {
            var name = nameFrom(email);
            list.push({ name: name, email: email, phone: phone, passHash: h, time: Date.now() });
            if (!A.save(A.CUSTOMERS, list)) return fail('signup-err', 'Could not save. Please try again.');
            done('signup-ok', '✓ Account created! Opening your dashboard...', name, email, phone);
        });
    });
})();
