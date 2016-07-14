'use strict';

/**
 * Module dependencies.
 */
var jwt    = require('jsonwebtoken');
var jwtConfig = require('./../config/jwtconfig').jwtconfig;
var User = require('mongoose').model('User');

/**
 * List
 */
exports.index = function (req, res) {
    var page = (req.query.page > 0 ? req.query.page : 1) - 1;
    var limit = 30;
    var options = {
      limit: limit,
      page: page
    };

    var count = User.count();
    User.list(options, function ( err, users ){
        if(err) res.status(500).json(err.message);
        res.status(200).json({
          users: users,
          page: page + 1,
          pages: Math.ceil(count / limit)
        });
    });
};

exports.login = function (req, res) {
  // find the user
  User.findOne({
      username: req.body.username
    }, function(err, user) {

      if (err) throw err;

      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {

        // check if password matches
        if (!user.authenticate(req.body.password)) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {
          // if user is found and password is right then create a token
          var token = jwt.sign(user, jwtConfig.secret, {
            expiresIn: jwtConfig.tokenExpirationTime
          });

          res.status(200).json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }   

      }
    });
};

/**
 * Load
 */

exports.load = function (req, res, next, id) {
   User.load(id)
    .then(function (response) {
      if (!response) return next(new Error('User not found'));
      req.profile = response;      
      next();
    });    
};
/**
 * Create user
 */

exports.create = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.save(function (err) {
      if(err) return res.status(500).send( err.message);
      res.status(200).json(user);
  });
};

/**
 *  Show profile
 */

exports.show = function (req, res) {
  var user = req.profile;
  res.status(200).json({user: user});
};