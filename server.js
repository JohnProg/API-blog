var express     = require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var app         = express();
var server = require('http').createServer(app);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

//Body-parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use morgan to log requests to the console
app.use(morgan('dev'));

// Require our database configuration file
require('./config/database');

// Bootstrap routes
require('./config/routes')(app, express);

server.listen(server_port, server_ip_address, function(){
  console.log('Express server listening on port ' + server_port);
});

//node-debug -p 3000 server.js
//http://blog-latrucha.rhcloud.com/api/todos