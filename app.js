/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var AmazonEchoApp = require('node-alexa');
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL); //Heroku Redis
var SpeechHandler = require('./speech_handler.js')
var speechHandlerInstance = new SpeechHandler()
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

//Setup for Express server
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var appId = 'amzn1.echo-sdk-ams.app.655fae42-075f-4425-827b-8999daeb188a' //Amazon Echo App ID
var echoApp = new AmazonEchoApp(client, "marta-times", appId);

echoApp.decorateAppWithRoutes('/', app);

//Handle Echo Launch Request with welcome message
echoApp.on(echoApp.TYPE_LAUNCH_REQUEST, function(callback, userId, sessionInfo, userObject){
    var speechText = "Welcome to the Marta App";
    var cardTitle = "Marta App Launched";
    var cardSubtitle = "userId " + userId;
    var cardContents = "Try a new command like 'Alexa, ask Marta when does the north bound train arrive at Midtown station'";
    var sessionObject = false;
    if(!userObject){
        //no long term persistance for this use
    }
    else{
        //this user has a long term storage session 
    }
    callback(false, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
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
    } else {
      echoApp.returnErrorResponse(callback, "Sorry, nobody has implemented the command "+intent.name);
      return;
    }
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});