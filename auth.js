// Login ke common functions (demo: data isi browser me save hota hai)
window.FixAuth = {
    WORKERS: 'fixnearWorkers',
    CUSTOMERS: 'fixnearCustomers',
    SESSION: 'fixnearSession',

    email: function (e) { return String(e || '').trim().toLowerCase(); },
    validEmail: function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },
    phone: function (p) { return String(p || '').replace(/[\s-]/g, ''); },
    validPhone: function (p) { return /^\+?\d{10,13}$/.test(p); },

    // Password ko seedha save nahi karte, uska hash save hota hai
    hash: function (pw) {
        var text = 'fixnear:' + pw;
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
                return Array.prototype.map.call(new Uint8Array(buf), function (b) {
                    return ('0' + b.toString(16)).slice(-2);
                }).join('');
            });
        }
        return Promise.resolve('x' + btoa(unescape(encodeURIComponent(text))));
    },

    load: function (key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
    },
    save: function (key, list) {
        try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; }
    },

    setSession: function (role, name, email, phone) {
        try { localStorage.setItem(this.SESSION, JSON.stringify({ role: role, name: name, email: email, phone: phone })); } catch (e) {}
    },
    getSession: function () {
        try { return JSON.parse(localStorage.getItem(this.SESSION)); } catch (e) { return null; }
    },
    logout: function () {
        try { localStorage.removeItem(this.SESSION); } catch (e) {}
    }
};
