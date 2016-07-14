
'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {
  var criteria = { tags: req.params.tag };
  var page = (req.params.page > 0 ? req.params.page : 1) - 1;
  var limit = 30;
  var options = {
    limit: limit,
    page: page,
    criteria: criteria
  };
  var count = Article.count(criteria);
  Article.list(options, function ( err, articles ){
      if(err) res.send(500, err.message);
      res.status(200).json({
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / limit)
      });
  });
};