'use strict';

/**
 * Module dependencies.
 */
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var jwtConfig = require('./../config/jwtconfig').jwtconfig;
var users = require('../controllers/users');
var articles = require('../controllers/articles');
var comments = require('../controllers/comments');
var tags = require('../controllers/tags');
var User = require('mongoose').model('User');
//var auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

//var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
//var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

/**
 * Expose routes
 */

module.exports = function (app, express) {

  // user routes
  /*app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);*/

  app.get('/setup', function(req, res) {
    // create a sample user
    var nick = new User({ 
      username: 'johnprog', 
      password: '123',
      email: 'john.cfmr.2009@gmail.com',
      admin: true 
    });
    nick.save(function(err) {
      if (err) res.status(500).json(err);

      console.log('User saved successfully');
      res.json({ success: true });
    });
  });
  app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + '/api');
  });

  // API routes
  var APIRouter = express.Router();
  
  APIRouter.post('/login', users.login);
  APIRouter.post('/signup', users.create);
  // ---------------------------------------------------------
  // route middleware to authenticate and check token
  // ---------------------------------------------------------
  APIRouter.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, jwtConfig.secret, function(err, user) {      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.currentUser = user;  
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({ 
        success: false, 
        message: 'No token provided.'
      });
      
    }
    
  });
  APIRouter.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
  });
  APIRouter.get('/check', function(req, res) {
    res.json(req.currentUser._doc);
  });  
  APIRouter.get('/users', users.index);
  APIRouter.get('/users/:id', users.show);
  APIRouter.param('id', users.load);

  // article routes
  APIRouter.param('id', articles.load);
  APIRouter.get('/articles', articles.index);
  APIRouter.post('/articles', articles.create);
  APIRouter.get('/articles/:id', articles.show);
  //APIRouter.get('/articles/:id/edit', articleAuth, articles.edit);
  APIRouter.put('/articles/:id', articles.update);
  APIRouter.delete('/articles/:id', articles.destroy);

  // comment routes
  APIRouter.param('commentId', comments.load);
  APIRouter.post('/articles/:id/comments', comments.create);
  APIRouter.get('/articles/:id/comments', comments.create);
  APIRouter.delete('/articles/:id/comments/:commentId', comments.destroy);

  // tag routes
  APIRouter.get('/tags/:tag', tags.index);

  app.use('/api', APIRouter);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).json({ error: err.stack });
      return;
    }

    // error page
    res.status(500).json({ error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).json({
      url: req.originalUrl,
      error: 'Not found'
    });
  });  
};