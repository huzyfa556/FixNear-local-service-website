// Worker registration: data browser me save hota hai aur Workers page par card ban jata hai
(function () {
    var A = window.FixAuth;
    var form = document.getElementById('register-form');
    if (!form) return;
    var err = document.getElementById('reg-error');
    var ok = document.getElementById('reg-success');
    if (!A) {
        err.textContent = 'auth.js file is missing. Please put auth.js in the same folder.';
        err.hidden = false;
        return;
    }

    // Photo ko chhota karke (400px) text me badalta hai taake save ho sake
    function readPhoto(file, done) {
        if (!file) return done('');
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var max = 400, r = Math.min(1, max / Math.max(img.width, img.height));
                var c = document.createElement('canvas');
                c.width = Math.round(img.width * r);
                c.height = Math.round(img.height * r);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                done(c.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = function () { done(''); };
            img.src = reader.result;
        };
        reader.onerror = function () { done(''); };
        reader.readAsDataURL(file);
    }

    function fail(msg) {
        err.textContent = msg; err.hidden = false; ok.hidden = true;
        if (err.scrollIntoView) err.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = form.name.value.trim();
        var email = A.email(form.email.value);
        var phone = A.phone(form.phone.value);
        var exp = parseInt(form.exp.value, 10);
        var loc = form.location.value.trim();
        var pw = form.password.value;
        var workers = A.load(A.WORKERS);

        if (name.length < 2) return fail('Please enter your name.');
        if (!A.validEmail(email)) return fail('Please enter a valid email.');
        if (!A.validPhone(phone)) return fail('Please enter a valid phone number.');
        if (!form.service.value) return fail('Please select your service.');
        if (isNaN(exp) || exp < 0 || exp > 60) return fail('Please enter your experience in years (0-60).');
        if (loc.length < 3) return fail('Please write your location.');
        if (pw.length < 6) return fail('Password must be at least 6 characters.');
        for (var i = 0; i < workers.length; i++) {
            if (workers[i].email === email) return fail('This email is already registered. Please login.');
            if (workers[i].phone === phone) return fail('This phone number is already registered.');
        }
        err.hidden = true;

        A.hash(pw).then(function (passHash) {
            readPhoto(form.photo.files[0], function (photo) {
                var w = { id: 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: name, email: email, phone: phone, service: form.service.value, exp: exp, location: loc, photo: photo, passHash: passHash, time: Date.now() };
                workers.push(w);
                if (!A.save(A.WORKERS, workers)) {
                    // jagah kam ho to photo ke bina save karo
                    w.photo = '';
                    if (!A.save(A.WORKERS, workers)) return fail('Could not save. Please try again.');
                }
                form.reset();
                ok.hidden = false;
                // Signup ke baad worker ka dashboard khul jata hai
                A.setSession('worker', w.name, w.email, w.phone);
                setTimeout(function () { window.location.href = 'worker-dashboard.html'; }, 1200);
            });
        });
    });
})();
