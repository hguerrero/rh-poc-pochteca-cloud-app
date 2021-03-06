var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

function formRoute() {
  var form = new express.Router();
  form.use(cors());
  form.use(bodyParser());

  // middleware specific to this router
  form.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
  });

  // GET REST endpoint - query params may or may not be populated
  form.get('/mbaas/forms/:appId/:formId', function(req, res) {
    $fh.forms.getForm({
       "_id": req.params.formId
     }, function (err, form) {
       if (err) return res.status(500).json(err);
       return res.json(form);
     });
  });
  
  // POST method route
  form.post('/', function (req, res) {
    res.send('POST request to the homepage');
  });

  return form;
}

module.exports = formRoute;