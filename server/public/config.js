// client/config.js
// Local
// ملي تنشر: بدل BACKEND_URL بــ URL ديال السيرفر (Render/VPS...)

const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

window.APP_CONFIG = {
  BACKEND_URL: isLocalhost ? "http://localhost:5000" : window.location.origin
};
