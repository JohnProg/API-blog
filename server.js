#!/bin/env node
//  OpenShift sample Node application
var config      = require('./config'); // get our config file
//var mongodb     = require('mongolab-provider').init('liveupload', config.api_settings);
var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var app         = express();

var server = require('http').createServer(app);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var io = require('socket.io').listen(server);


// Mongoose Schema definition
Schema = new mongoose.Schema({
  id       : String, 
  title    : String,
  completed: Boolean
}),

Todo = mongoose.model('Todo', Schema);

var MONGO_URL = '127.0.0.1:27017/' + process.env.OPENSHIFT_APP_NAME;

// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    MONGO_URL = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
}

// Connect to mongodb
var connect = function () {
    mongoose.connect(MONGO_URL);
};
connect();

var db = mongoose.connection;

db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);




//app.set('superSecret', config.secret); 

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api', function (req, res) {
    res.json(200, {msg: 'OK' });
})

app.get('/api/todos', function (req, res) {
    // http://mongoosejs.com/docs/api.html#query_Query-find
    Todo.find( function ( err, todos ){
      res.json(200, todos);
    });
  })

app.post('/api/todos', function (req, res) {
    var todo = new Todo( req.body );
    todo.id = todo._id;
    // http://mongoosejs.com/docs/api.html#model_Model-save
    todo.save(function (err) {
      res.json(200, todo);
    });
  })

app.del('/api/todos', function (req, res) {
    // http://mongoosejs.com/docs/api.html#query_Query-remove
    Todo.remove({ completed: true }, function ( err ) {
      res.json(200, {msg: 'OK'});
    });
  })

app.get('/api/todos/:id', function (req, res) {
    // http://mongoosejs.com/docs/api.html#model_Model.findById
    Todo.findById( req.params.id, function ( err, todo ) {
      res.json(200, todo);
    });
  })

app.put('/api/todos/:id', function (req, res) {
    // http://mongoosejs.com/docs/api.html#model_Model.findById
    Todo.findById( req.params.id, function ( err, todo ) {
      todo.title = req.body.title;
      todo.completed = req.body.completed;
      // http://mongoosejs.com/docs/api.html#model_Model-save
      todo.save( function ( err, todo ){
        res.json(200, todo);
      });
    });
  })

app.del('/api/todos/:id', function (req, res) {
    // http://mongoosejs.com/docs/api.html#model_Model.findById
    Todo.findById( req.params.id, function ( err, todo ) {
      // http://mongoosejs.com/docs/api.html#model_Model.remove
      todo.remove( function ( err, todo ){
        res.json(200, {msg: 'OK'});
      });
    });
  })

/*
app.use(bodyParser.raw());

app.use(function(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, X-Auth-Token, x-key");

    res.setHeader('Content-Type', 'application/json');
    next();

});



io.sockets.on("connection", function(socket) {
    socket.on('something', function(data){
        console.log(data);
        io.sockets.emit('saludo', "hola");
    });
});

// Authentication
var jwt = require('jsonwebtoken');
var expiresInSession = 86400; // expires in 24 hours

var errorResponse = {
    status: "ERROR"
};
var authResponse = {
    status: "OK"
};

function authorized(req, res, next) {
    var header = req.headers;
    console.log('header.authorization:' + header['x-auth-token']);
     // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || header['x-auth-token'];
    // decode token
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if(err) {
                res.status(403);
                res.send(errorResponse);
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
        
    }
}


app.get('/', function(req, res) {
    res.send("Hello John");
});

app.get('/notifications', authorized, function(req, res) {
    // res.send(Notifications);
    mongodb.documents('alerts', {sort: {"created_at":-1}}, function (err, data) {
        var result = null;
        if (err || data.length === 0) {
            result = errorResponse;
        } else {
            result = data;
        }
        res.json(result);
    });
});


// Verifying token
app.get('/check', authorized, function(req, res) {
    res.json(req.decoded);
});
app.get('/users/', authorized, function(req, res) {
    res.json({name: "name"});
});
*/
app.use(express.static(__dirname + '/'))
//server.listen(server_port, server_ip_address);
server.listen(server_port, function () {
  console.log('Server listening at port %d', server_port);
});