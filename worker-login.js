// Worker login (email + password). Account Sign Up page se banta hai
(function () {
    var A = window.FixAuth;
    var form = document.getElementById('worker-login-form');
    if (!form) return;
    var err = document.getElementById('wlogin-err');
    var ok = document.getElementById('wlogin-ok');

    function fail(msg) { err.textContent = msg; err.hidden = false; ok.hidden = true; }
    if (!A) return fail('auth.js file is missing. Please put auth.js in the same folder.');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = A.email(form.email.value);
        var pw = form.password.value;
        if (!A.validEmail(email)) return fail('Please enter a valid email.');
        if (!pw) return fail('Please enter your password.');

        A.hash(pw).then(function (h) {
            var list = A.load(A.WORKERS), user = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i].email === email && list[i].passHash === h) user = list[i];
            }
            if (!user) return fail('Wrong email or password. New worker? Sign up first.');
            err.hidden = true;
            A.setSession('worker', user.name, user.email, user.phone);
            ok.textContent = '✓ Login successful! Opening your dashboard...';
            ok.hidden = false;
            setTimeout(function () { window.location.href = 'worker-dashboard.html'; }, 900);
        });
    });
})();
