// Worker login (account Register page se banta hai)
(function () {
    var A = window.FixAuth;
    var form = document.getElementById('worker-login-form');
    if (!form) return;
    var err = document.getElementById('wlogin-err');
    var ok = document.getElementById('wlogin-ok');

    function fail(msg) { err.textContent = msg; err.hidden = false; ok.hidden = true; }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var phone = A.phone(form.phone.value);
        var pw = form.password.value;
        if (!A.validPhone(phone)) return fail('Please enter a valid phone number.');
        if (!pw) return fail('Please enter your password.');

        A.hash(pw).then(function (h) {
            var list = A.load(A.WORKERS), user = null, noPass = false;
            for (var i = 0; i < list.length; i++) {
                if (list[i].phone !== phone) continue;
                if (!list[i].passHash) noPass = true;
                else if (list[i].passHash === h) user = list[i];
            }
            if (!user) {
                return fail(noPass
                    ? 'This worker has no password yet. Please register again with a password.'
                    : 'Wrong phone number or password. New worker? Register first.');
            }
            err.hidden = true;
            A.setSession('worker', user.name, user.phone);
            ok.textContent = '✓ Login successful! Taking you to workers...';
            ok.hidden = false;
            setTimeout(function () { window.location.href = 'workers.html'; }, 900);
        });
    });
})();