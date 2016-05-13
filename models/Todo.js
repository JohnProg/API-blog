var mongoose    = require('mongoose');

// Mongoose Schema definition
var TodoSchema = new mongoose.Schema({
  id       : String, 
  title    : String,
  completed: Boolean,
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', TodoSchema);