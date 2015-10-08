var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var _ = require('underscore');

// list the endpoints which you want to make securable here
var securableEndpoints;
// fhlint-begin: securable-endpoints
securableEndpoints = ['/hello'];
// fhlint-end

var app = express();

// Enable CORS for all requests
app.use(cors());

// Note: add this first to override mbaas api
app.get('/mbaas/forms/:appId/:formId', function(req, res, next) {
  console.log("Lookup form: " + req.params.formId); 
  if (req.params.formId == '560c2d68d1596bad10c427d3') {
    mbaasApi.forms.getForm({
     "_id": req.params.formId
    }, function (err, form) {
      if (err) return res.status(500).json(err);
      console.log("Retrieved form: " + form.name + " = " + form.description); 
      _.each(form.pages, function(page, index, list){
        _.each(page.fields, function(field, index, list){
          if (field.type == 'dropdown') {
            var fieldCode = field.fieldCode.toLowerCase();
            //var options = field.fieldOptions.definition.options;
            var options = [];
            var params = {
              "act": "list",
              "type": fieldCode.slice(1,fieldCode.length - 1), // Entity/Collection name
            };
            mbaasApi.db(params, function (err, data) {
              if (err) return res.status(500).json(err);
              //console.log(JSON.stringify(data));
              _.each(data, function(row, index, list){
                options.push({ "checked" : false, "label" : row.value });
              });
              console.log(JSON.stringify(options));
            });
          }
        });
      });
      return res.json(form);
    });
  } else {
    next();
  }
});

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// fhlint-begin: custom-routes
//app.use('/hello', require('./lib/overrider.js')());
// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var server = app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
