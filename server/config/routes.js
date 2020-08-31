const auth        = require("../controllers/auth");

module.exports = function (app) {
  app.post('/auth/login', auth.login); // Login Route
  app.post('/auth/register', auth.register); // Registration route
}