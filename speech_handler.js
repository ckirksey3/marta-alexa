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
  callback(true, errorText, "Error", errorText, "", sessionObject);
}

/**
 * Filters the API results down to the event for a specific station and train direction
 * @param {Object} intent
 * @param {Function} callback
 */
SpeechHandler.prototype.handleMartaRequest = function (intent, callback) {
	console.log("FULL INTENT: " + util.inspect(intent, false, null));
	console.log("SLOTS: " + util.inspect(intent.slots, false, null));
	console.log("STATION: " + util.inspect(intent.slots['Station'], false, null));
	var direction, station;

	//only support request with both a direction and a station
	station = intent.slots['Station'].value;
	if(station) {
		direction = intent.slots['Direction'].value;
	} else {
		handleError("Must specify a Marta station", sessionObject, callback);
	}

	var cardSubtitle = "";
	var sessionObject = false;
	var cardContents, speechText, cardTitle;

	if(direction) {
	//request an estimated arrival time for that station/direction from the Marta API
	martaApiInstance.getTime(station, direction, function logResult(err, result) {
		if(err) {
			handleError("The Marta API is currently down", sessionObject, callback);
		}
		console.log(result)
		speechText = "The next " + direction + " bound train will arrive at " + station + " station in " + result + " minutes";
		cardTitle = direction + " bound train arrives at " + station + " in " + result + " minutes";
	})
	} else {
	//request several arrival times for that station from the Marta API
	martaApiInstance.getTimesByStation(station, function logResult(err, result) {
	if(err) {
		handleError("The Marta API is currently down", sessionObject, callback);
	}
		console.log(result)
		speechText = "The " + station + " station has trains arriving ";
		cardTitle = "The " + station + " station has trains arriving ";
		result.forEach(function(event) {
			speechText += "going " + direction + " in " + result + " minutes";
			cardTitle += "going " + direction + " in " + result + " minutes";
		})
	})
	}
	console.log("SPEECH TEXT: " + speechText);
	callback(false, speechText, cardTitle, cardSubtitle, cardContents, sessionObject);
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