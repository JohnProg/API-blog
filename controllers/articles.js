
'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var assign = require('object-assign')
var only = require('only');
var Article = mongoose.model('Article');

/**
 * Load
 */

exports.load = function (req, res, next, id) {
  req.article = Article.load(id);
  if (!req.article) return next(new Error('Article not found'));
  next();
};


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

    var count = Article.count();
    Article.list(options, function ( err, articles ){
        if(err) res.status(500).json(err.message);
        res.status(200).json({
          articles: articles,
          page: page + 1,
          pages: Math.ceil(count / limit)
        });
    });
};

/*exports.index = wrap(function* (req, res) {
  var page = (req.query.page > 0 ? req.query.page : 1) - 1;
  var limit = 30;
  var options = {
    limit: limit,
    page: page
  };

  var articles = yield Article.list(options);
  var count = yield Article.count();

  res.render('articles/index', {
    title: 'Articles',
    articles: articles,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});
*/
/**
 * Create an article
 * Upload an image
 */

exports.create = function (req, res) {
    var article = new Article(only(req.body, 'title body tags banner'));
    article.id = article._id;
    article.user = req.user;
    // http://mongoosejs.com/docs/api.html#model_Model-save
    article.save(function (err) {
        if(err) return res.status(500).json(err.message);
        res.status(200).json(article);
    });
}
/*
exports.create = wrap(function* (req, res) {
  const article = new Article(only(req.body, 'title body tags'));
  const images = req.files.image
    ? [req.files.image]
    : undefined;

  article.user = req.user;
  yield article.uploadAndSave(images);
  req.flash('success', 'Successfully created article!');
  res.redirect('/articles/' + article._id);

/**
 * Update article
 */
exports.update = function (req, res) {
  // http://mongoosejs.com/docs/api.html#model_Model.findById
  Article.findById( req.params.id, function ( err, article ) {
    article = assign(article, only(req.body, 'title body tags banner'));
    // http://mongoosejs.com/docs/api.html#model_Model-save
    article.save( function ( err, article ){
      res.status(200).json(article);
    });
  });
}
/*exports.update = wrap(function* (req, res){
  var article = req.article;
  var images = req.files.image
    ? [req.files.image]
    : undefined;

  assign(article, only(req.body, 'title body tags'));
  yield article.uploadAndSave(images);
  res.redirect('/articles/' + article._id);
});*/

/**
 * Show
 */
exports.show = function (req, res) {
  // http://mongoosejs.com/docs/api.html#model_Model.findById
  res.status(200).json(req.article);
};
/*exports.show = function (req, res){
  res.render('articles/show', {
    title: req.article.title,
    article: req.article
  });
};*/

/**
 * Delete an article
 */
exports.destroy = function (req, res) {
  // http://mongoosejs.com/docs/api.html#model_Model.findById
  Article.findById( req.params.id, function ( err, article ) {
    // http://mongoosejs.com/docs/api.html#model_Model.remove
    article.remove( function ( err, article ){
      res.status(200).json({msg: 'OK'});
    });
  });
};
/*
exports.destroy = wrap(function* (req, res) {
  yield req.article.remove();
  req.flash('success', 'Deleted successfully');
  res.redirect('/articles');
});*/