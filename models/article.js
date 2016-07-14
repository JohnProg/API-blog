'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

// var Imager = require('imager');
// var config = require('../../config/config');
// var imagerConfig = require(config.root + '/config/imager.js');

var Schema = mongoose.Schema;

var getTags = function (tags) {
  return tags.join(',');
}  
var setTags = function (tags) {
  return tags.join(',');
}  

/**
 * Article Schema
 */

var ArticleSchema = new Schema({
  title: { type : String, default : '', trim : true },
  body: { type : String, default : '', trim : true },
  banner: { type : String, default : '', trim : true },
  user: { type : Schema.ObjectId, ref : 'User' },
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
    createdAt: { type : Date, default : Date.now }
  }],
  tags: { type: [], get: getTags, set: setTags },
  createdAt  : { type : Date, default : Date.now }
});

/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'Article title cannot be blank');
ArticleSchema.path('body').required(true, 'Article body cannot be blank');

/**
 * Pre-remove hook
 */

ArticleSchema.pre('remove', function (next) {
  // var imager = new Imager(imagerConfig, 'S3');
  // var files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

ArticleSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @api private
   */

  /*saveArticle: function (images) {
    var err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
  },*/

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function (user, comment, callBack) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });
    return this.save(callBack);
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function (commentId, callBack) {
    var index = this.comments
      .map(function (comment) {
        return comment.id;
      })
      .indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save(callBack);
  }
};

/**
 * Statics
 */

ArticleSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function (options, callback) {
    var criteria = options.criteria || {};
    var page = options.page || 0;
    var limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec(callback);
  }
};

mongoose.model('Article', ArticleSchema);