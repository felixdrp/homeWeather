'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  //Detect if it is a mobile
  if (/mobile/i.test(req.headers['user-agent'])) {
    res.render('index', { title: 'MOBILE homeWeather' });
  } else {
    res.render('index', { title: 'homeWeather' });
  }
//    console.log(req);
//  res.sendfile('public/ui.html');
});

/* GET measureBox template */
router.get('/measureBox', function(req, res) {
  res.render('measureBox', { title: 'Express' });
});

module.exports = router;
