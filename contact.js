// Contact form: check karke thank-you message dikhata hai
(function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var err = document.getElementById('form-error');
    var ok = document.getElementById('form-success');

    // Workers page se aaye to service pehle se select ho
    var params = new URLSearchParams(location.search);
    var pre = params.get('service');
    if (pre) {
        var opts = form.service.options;
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].text === pre) form.service.selectedIndex = i;
        }
    }

    // Login customer ka naam aur phone pehle se bharo
    try {
        var ses = JSON.parse(localStorage.getItem('fixnearSession'));
        if (ses && ses.role === 'customer') {
            if (form.name && !form.name.value) form.name.value = ses.name || '';
            if (form.phone && !form.phone.value) form.phone.value = ses.phone || '';
            if (form.email && !form.email.value) form.email.value = ses.email || '';
        }
    } catch (e) {}

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        ok.hidden = true;
        var name = form.name.value.trim();
        var phone = form.phone.value.replace(/[\s-]/g, '');
        var email = form.email.value.trim();
        var msg = '';

        if (name.length < 2) msg = 'Please enter your name.';
        else if (!/^\+?\d{10,13}$/.test(phone)) msg = 'Please enter a valid phone number.';
        else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = 'Please enter a valid email.';
        else if (!form.service.value) msg = 'Please select a service.';
        else if (form.location && form.location.value.trim().length < 3) msg = 'Please write your location.';
        else if (form.message.value.trim().length < 5) msg = 'Please write a short message.';

        if (msg) {
            err.textContent = msg;
            err.hidden = false;
            return;
        }
        err.hidden = true;
        form.reset();
        ok.hidden = false;
    });
})();
