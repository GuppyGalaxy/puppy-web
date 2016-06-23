var mlf = module.exports = {}
mlf.express = require('express');
mlf.exphbs  = require('express3-handlebars');
mlf.passport = require('passport');
mlf.LocalStrategy = require('passport-local');
mlf.TwitterStrategy = require('passport-twitter');
mlf.GoolgeStrategy = require('passport-google');
mlf.FacebookStrategy = require('passport-facebook');

mlf.config = require('./config.js'); //config file contains all tokens and other private info
mlf.funct = require('./functions.js');

mlf.app = mlf.express();

//===============PASSPORT=================

// Passport session setup.
mlf.passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

mlf.passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
mlf.passport.use('local-signin', new mlf.LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    mlf.funct.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Use the LocalStrategy within Passport to Register/"signup" users.
mlf.passport.use('local-signup', new mlf.LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    mlf.funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
mlf.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
}


//===============EXPRESS=================

// Configure Express
mlf.app.use(mlf.express.logger());
mlf.app.use(mlf.express.cookieParser());
mlf.app.use(mlf.express.bodyParser());
mlf.app.use(mlf.express.methodOverride());
mlf.app.use(mlf.express.session({ secret: 'supernova' }));
mlf.app.use(mlf.passport.initialize());
mlf.app.use(mlf.passport.session());

// Session-persisted message middleware
mlf.app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

mlf.app.use(mlf.app.router);

// Configure express to use handlebars templates
mlf.hbs = mlf.exphbs.create({
    defaultLayout: 'main',
});
mlf.app.engine('handlebars', mlf.hbs.engine);
mlf.app.set('view engine', 'handlebars');


//===============ROUTES=================

//displays our homepage
mlf.app.get('/', function(req, res){
  res.render('home', {user: req.user});
});

//opens the chat page
mlf.app.get('/chat', function(req, res){
  res.render('chat', {user: req.user, use: true});
});

//displays our signup page
mlf.app.get('/signin', function(req, res){
  res.render('signin');
});

//makes the folder "public" available for serving files by themselves.
mlf.app.use(mlf.express.static('public'));

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
mlf.app.post('/local-reg', mlf.passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
mlf.app.post('/login', mlf.passport.authenticate('local-signin', { 
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
mlf.app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGING OUT " + req.user.username)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});
mlf.app.get('change-profile-pic', function(req, res){
  req.user
})

//===============PORT=================
var port = process.env.PORT || 5000;
mlf.app.listen(port);
console.log("listening on " + port + "!");