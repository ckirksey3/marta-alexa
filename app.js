/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var AmazonEchoApp = require('node-alexa');
var redis = require('redis');
var url = require('url');
var verifier = require('alexa-verifier');
var redisURL = url.parse(process.env.REDISCLOUD_URL); //Heroku Redis
var SpeechHandler = require('./speech_handler.js')
var constants = require('./marta_constants.js');
var speechHandlerInstance = new SpeechHandler()
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

//Setup for Express server

//thanks @mreinstein to for writing this example https://github.com/mreinstein/alexa-verifier
app.use(function(req, res, next) {
  if (!req.headers.signaturecertchainurl) {
    return next();
  }
  req._body = true;
  req.rawBody = '';
  req.on('data', function(data) {
    return req.rawBody += data;
  });
  return req.on('end', function() {
    var cert_url, er, requestBody, signature;
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (_error) {
      er = _error;
      req.body = {};
    }
    cert_url = req.headers.signaturecertchainurl;
    signature = req.headers.signature;
    requestBody = req.rawBody;
    return verifier(cert_url, signature, requestBody, function(er) {
      if (er) {
        console.error('error validating the alexa cert:', er);
        return res.status(401).json({
          status: 'failure',
          reason: er
        });
      } else {
        return next();
      }
    });
  });
});
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var appId = 'amzn1.echo-sdk-ams.app.655fae42-075f-4425-827b-8999daeb188a' //Amazon Echo App ID
var echoApp = new AmazonEchoApp(client, "marta-times", appId);

echoApp.decorateAppWithRoutes('/', app);

//Handle Echo Launch Request with welcome message
echoApp.on(echoApp.TYPE_LAUNCH_REQUEST, function(callback, userId, sessionInfo, userObject){
    var speechText = "Welcome to the " + constants.SKILL_NAME + " Skill. Try asking me about trains arriving at Midtown station";
    var cardTitle = constants.SKILL_NAME + " Skill Launched";
    var cardSubtitle = "Get your train times here!";
    var cardContents = "Try a new command like 'Alexa, ask " + constants.SKILL_NAME + " when does the north bound train arrive at Midtown station'";
    var sessionObject = false;
    var shouldEndSession = false;
    if(!userObject){
        //no long term persistance for this use
    }
    else{
        //this user has a long term storage session 
    }
    callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
});

//Handle Echo request for train time
echoApp.on(echoApp.TYPE_INTENT_REQUEST, function(callback, userId, sessionInfo, userObject, intent){
    sessionObject = false;
    if(intent.name === 'Marta'){
        if(intent.slots) {
          speechHandlerInstance.handleMartaRequest(intent, callback);
          return;
        } else {
          echoApp.returnErrorResponse(callback, "Missing required inputs, please try again");
          return;
        }
    } else if(intent.name === 'AMAZON.HelpIntent') {
      var speechText = "Try asking me about the arrival times for different train stations by saying 'What are the times for the Airport' or " + 
        "request a specific direction like 'Ask " + constants.SKILL_NAME + " for trains at Midtown station going North'";
      var cardTitle = constants.SKILL_NAME + " Help";
      var cardSubtitle = "Hope this helps";
      var cardContents = "Try asking me about the arrival times for different train stations by saying 'What are the times for the Airport' or " + 
        "request a specific direction like 'Ask " + constants.SKILL_NAME + " for trains at Midtown station going North'";
      var sessionObject = false;
      var shouldEndSession = true;
      callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
    } else if(intent.name === 'AMAZON.StopIntent') {
      var speechText = "Goodbye";
      var cardTitle = constants.SKILL_NAME + " Session Closed";
      var cardSubtitle = "Have a great day";
      var cardContents = "";
      var sessionObject = false;
      var shouldEndSession = false;
      callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
    } else {
      echoApp.returnErrorResponse(callback, "Sorry, nobody has implemented the command "+intent.name);
      return;
    }
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});