'use strict';

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  req.comment = req.article.comments
    .filter(function (comment) {
      return comment.id === id
    })
    .reduce(function (c) {
      return c;
    });

  if (!req.comment) return next(new Error('Comment not found'));
  next();
};

/**
 * Create comment
 */

exports.create = function (req, res) {
  var article = req.article;
  article.addComment(req.user, req.body, function (err) {
      if(err) return res.status(500).send( err.message);
      res.status(200).json(article);
  });
};

/**
 * Delete comment
 */

exports.destroy = function (req, res) {
  req.article.removeComment(req.params.commentId, function ( err, article ){
    res.status(200).json({msg: 'OK'});
  });
};