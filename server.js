const   bp              = require('body-parser'),
        express         = require('express'),
        helmet          = require('helmet'),
        expressJWT      = require('express-jwt'),
        jwtKey          = require('./keys/keys').jwtKey,
        path            = require('path'),
        app             = express(),
        port            = process.env.PORT || 3000,
        serverFunctions = require('./server/services/serverFunctions.js');

// Use expressJWT
app.use('/api', expressJWT({ secret: jwtKey, algorithms: ["HS256"] }));
// Check token against redis database
app.use('/api', (req, res, next) => serverFunctions.tokenChecker(req, res, next));

const server = app.listen(port, function () {
	console.log(`server running on port ${port}`);
});

// CORS exceptions
app.use((req, res, next) => serverFunctions.cors(req, res, next));
app.use(helmet());
app.use(bp.json());

// This is for the front end, being able to route through them.
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize the routes
require('./server/config/routes.js')(app);

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.json({ message: "admin" , error: err.message});
  next(err)
})
