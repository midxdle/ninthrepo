var express = require('express');
var router = express.Router();
var multer = require('multer');
const upload = multer({ dest: './public/images' })
var mongo = require('mongodb');
var db = require('monk')("mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net/nodeblog?retryWrites=true&w=majority");

router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');
  posts.findOne({ _id: req.params.id }, function(err, post) {
    res.render('show', {
      'post': post
    });
  });
});

router.get('/add', function(req, res, next) {

  var details = db.get('categories');

  details.find({}, {}, function(err, categories, authors) {
    res.render('addpost', {
      'title':'Add Post',
      'categories': categories,
      'authors':authors
    });
  });
})

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // Get Form Values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  // Check Image Upload
  if(req.file) {
    var mainimage = req.file.filename;
  } else {
    var mainmage = 'noimage.jpg';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors) {
    req.flash('error', 'Fields required');
    res.location('/posts/add');
    res.redirect('/posts/add');
    // res.render('addpost', {
    //   "errors": errors
    // });
  } else {
    var posts = db.get('posts');
    posts.insert({
      "title": title,
      "body": body,
      "category": category,
      "date": date,
      "author": author,
      "mainimage": mainimage,
    }, function(err, post) {
      if(err) {
        res.send(err);
      } else {
        req.flash('success', 'Post Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

router.post('/addcomment', function(req, res, next) {
  // Get Form Values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required but never displayed').notEmpty();
  req.checkBody('email', 'Email field is invalid').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors) {
    var posts = db.get('posts');
    posts.findOne({ _id: postid }, function(err, post) {
      res.render('show', {
        'post': post,
        'errors': errors
      });
    });
  } else {
    var comment = {
      "name": name,
      "email": email,
      "body": body,
      "commentdate": commentdate
    }

    var posts = db.get('posts');

    posts.update({
      "_id": postid
    }, {
      $push:{
        "comments": comment
      }
    }, function(err, doc) {
      if(err) {
        throw err;
      } else {
        req.flash('success', 'Comment Added');
        res.location('/posts/show/'+postid);
        res.redirect('/posts/show/'+postid);
      }
    });
  }
});

module.exports = router;
