var SpeechHandler = function() {}

/**
 * Module dependencies.
 */
var martaApi = require('./marta_api.js')
var martaApiInstance = new martaApi()
var util = require('util')

//Print any errors
function handleError(errorText, sessionObject, callback) {
  console.log("Error: " + errorText);
  var shouldEndSession = false;
  callback(shouldEndSession, errorText + " Please try again.", "Error", errorText, "", sessionObject);
}

/** 
* Credit to Dexter
* http://stackoverflow.com/questions/4878756/javascript-how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
*/
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/**
 * Filters the API results down to the event for a specific station and train direction
 * @param {Object} intent
 * @param {Function} callback
 */
SpeechHandler.prototype.handleMartaRequest = function (intent, callback) {
	//console.log("FULL INTENT: " + util.inspect(intent, false, null));
	console.log("SLOTS: " + util.inspect(intent.slots, false, null));
	console.log("STATION: " + util.inspect(intent.slots['Station'], false, null));
	var direction, station;

	//only support request with both a direction and a station
	station = intent.slots['Station'].value;
	if(station) {
		direction = intent.slots['Direction'].value;
	} else {
		handleError("Must specify a Marta station", sessionObject, callback);
		return;
	}

	var sessionObject = false;
	var shouldEndSession = true;
	var cardContents, speechText;
	var cardTitle = toTitleCase(station) + " Station";
	var cardSubtitle = "MARTA Times";

	if(direction) {
		//request an estimated arrival time for that station/direction from the Marta API
		martaApiInstance.getTime(station, direction, function logResult(err, result) {
			if(err) {
				handleError(err, sessionObject, callback);
			} else {
				console.log(result)
				speechText = "The next " + direction + " bound train will arrive at " + toTitleCase(station) + " station in " + result + " minutes";
				console.log("SPEECH TEXT: " + speechText);
				cardContents = speechText;
				callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
			}
		})
	} else {
		//request several arrival times for that station from the Marta API
		martaApiInstance.getTimesByStation(station, function logResult(err, result) {
			if(err) {
				handleError(err, sessionObject, callback);
			} else {
				console.log(result)
				speechText = "The " + toTitleCase(station) + " station has trains arriving";
				var directions = {
					"N": "North",
					"S": "South",
					"E": "East",
					"W": "West"
				}
				var hasSaidOneDirection = false;
				result.forEach(function(event) {
					if(event.direction in directions) {
						if(hasSaidOneDirection) {
							speechText += ", and"
						} else {
							hasSaidOneDirection = true;
						}
						speechText += " going " + directions[event.direction] + " in " + event.minutesUntilArrival + " minutes";

						//remove the key so that we only list times for a direction once
						delete directions[event.direction]
					}
					
				})
				console.log("SPEECH TEXT: " + speechText);
				cardContents = speechText;
				callback(shouldEndSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
			}
		})
	}
	return;
}


/**
 * Unit tests the handleMartaRequest function
 * execute 'nodeunit speech_handler.js' to run
 * @param {Object} test
 */
SpeechHandler.testHandleMartaRequest = function(test){
	var testIntent = {
      "name": "Marta",
      "slots": {
        "Station": {
          "name": "Station",
          "value": "North Avenue"
        },
        "Direction": {
          "name": "Direction",
          "value": "south"
        }
      }
    }
	martaApiInstance.getTime = function(station, direction, callback) {
	    callback(null, 2)
	};

	var speechHandler = new SpeechHandler();
	speechHandler.handleMartaRequest(testIntent, function callback(quitSession, speechText, cardTitle, cardSubtitle, cardContents, sessionObject) {
	   	var expectedSpeechText = "The next south bound train will arrive at North Avenue station in 2 minutes"
	   	test.equal(speechText, expectedSpeechText, "SpeechHandler failed to produced expected output");
	})
	test.done();
};

module.exports = SpeechHandler