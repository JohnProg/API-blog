var join = require('path').join;
var fs = require('fs');
/**
*We're going to require all the files in our server models folder
*Establish a models_path variable and then have a function to check each file
*/
var models_path = join(__dirname, './../models');

/*fs.readdirSync(models_path).forEach(function(file) {
  if(file.indexOf('.js') > 0) {
    require(models_path + '/' + file);
  }
})*/
fs.readdirSync(models_path)
  .filter(function (file) {
    return ~file.search(/^[^\.].*\.js$/);
  })
  .forEach(function (file) {
    return require(join(models_path, file));
  });

//Require file system so we can do things like path join
var fs = require('fs');

// Bootstrap BD
var mongoose = require('mongoose');

var MONGO_URL = '127.0.0.1:27017/' + (process.env.OPENSHIFT_APP_NAME || 'blog');

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
    console.log("Error loading the db - " + error);
});

db.on('disconnected', connect);
