/**
 * Module dependencies.
 */

var martaApi = require('./marta_api.js')
var martaApiInstance = new martaApi()

var appId = 'amzn1.echo-sdk-ams.app.655fae42-075f-4425-827b-8999daeb188a'

//NEW
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var AmazonEchoApp = require('node-alexa');
var redis = require('redis');
var url = require('url');
var util = require('util');
var redisURL = url.parse(process.env.REDISCLOUD_URL); //Heroku Redis
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


var echoApp = new AmazonEchoApp(client, "marta-times", appId);
echoApp.decorateAppWithRoutes('/', app);

echoApp.on(echoApp.TYPE_LAUNCH_REQUEST, function(callback, userId, sessionInfo, userObject){
    var shouldEndSession = false;
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
    callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
});

function handleError(errorText, callback, sessionObject) {
  console.log("Error: " + errorText);
  callback(shouldEndSession, errorText, "Error", errorText, "", sessionObject);
}

echoApp.on(echoApp.TYPE_INTENT_REQUEST, function(callback, userId, sessionInfo, userObject, intent){
    if(intent.name === 'Marta'){
        if(intent.slots) {
          console.log("FULL INTENT: " + util.inspect(intent, false, null));
          console.log("SLOTS: " + util.inspect(intent.slots, false, null));
          console.log("STATION: " + util.inspect(intent.slots['Station'], false, null));
          var direction, station;
          
          station = intent.slots['Station'].value;
          if(station) {
            direction = intent.slots['Direction'].value;
            if(!direction) {
              handleError("Must specify which direction for " + station, callback, sessionObject);
            }
          } else {
            handleError("Must specify a Marta station", callback, sessionObject);
          }
          
          martaApiInstance.getPassage(station, direction, function logResult(err, result) {
           console.log(result)
           var shouldEndSession = true;
           var cardSubtitle = "userId " + userId;
            var cardContents = result;
            var sessionObject = false;

            var speechText = "The next" + direction "bound train will arrive at " + station + "station in " result;
            var cardTitle = direction "train at " + station + " in " + result;
            callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
            return;
          })
        }
    } else {
      echoApp.returnErrorResponse(callback, "Sorry, nobody has implemented the command "+intent.name);
      return;
    }
});

echoApp.on(echoApp.TYPE_WEB_USER_DISPLAY, function(callback, userId, command, userObject){
    //This route is called when a user is directed to:
    // https://myurl.com/approute/input/"+userId;
    html = '<h1>Hello World</h1>';  
    callback(html);
});

echoApp.on(echoApp.TYPE_WEB_USER_INPUT, function(callback, userId, command, inputObj, userObject){
    //This route is called when data is posted to:
    // https://myurl.com/approute/input/"+userId;

    var message = "Got posted data.";
    //for example, if you collect username and password for a third party integration
    userObject = {email: inputObj.email,password: inputObj.password};
    callback(message, userObject);
    //user object will now be encrypted and stored in redis. It will automatically be decrypted and passed into to future events invoked by this user   
});


app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});