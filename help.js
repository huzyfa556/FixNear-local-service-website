// Help / Complaint form: email + problem check karke thank-you dikhata hai
(function () {
    var form = document.getElementById('help-form');
    if (!form) return;
    var err = document.getElementById('help-error');
    var ok = document.getElementById('help-success');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        ok.hidden = true;
        var email = form.email.value.trim();
        var problem = form.problem.value.trim();
        var msg = '';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = 'Please enter a valid email.';
        else if (problem.length < 10) msg = 'Please describe your problem (at least 10 characters).';

        if (msg) { err.textContent = msg; err.hidden = false; return; }
        err.hidden = true;
        form.reset();
        ok.hidden = false;
    });
})();
