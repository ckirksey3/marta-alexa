
var unirest, martaApiBaseUrl

var Marta = function() {
	unirest = require('unirest')
	martaApiBaseUrl = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey="
}

Marta.prototype.makeMartaGetRequest = function (station, direction, callback) {
	responseParser = require('./marta_response_parser.js')
	var api_key = process.env.MARTA_API_KEY
	console.log("API KEY: " + api_key)
	unirest.get(martaApiBaseUrl + api_key)
	.header("Accept", "application/json")
	.end(function (result) {
		console.log("Destination: " + station)
		console.log("Direction: " + direction)
		responseParser.prototype.getResultsByDirectionAndStation(result.body, direction, station, function getEvent(events){
			console.log(events)
			if(events.length > 0) {
				responseParser.prototype.getArrivalTimeFromEvent(events[0], function returnTime(err, timeOfArrival){
					responseParser.prototype.getMinutesUntilArrival(timeOfArrival, function returnMinutesUntilArrival(err, minutesUntilArrival) {
						callback(err, minutesUntilArrival)
					})
					
				})
			} else {
				callback("No events found for that station/direction", null)
			}
			
		})
	  callback(null, result)
	})
}

Marta.prototype.getTime = function (station, direction, callback) {
	this.makeMartaGetRequest(station, direction, function parseResponse(error, result) {
		console.log("getPass returned")
		//remove verse numbers
		var martaText = result;

		//handle error
		if(martaText == "error") {
			martaText = "Either I misheard you or that station does not exist."
			callback(martaText, null)
		}
		callback(null, martaText)
	})
}

Marta.testGetTime = function(test){
	//Mock makeMartaGetRequest
	Marta.prototype.makeMartaGetRequest = function (method, parameters, callback) {
		var result = { body: { Output: "10 minutes" } };
		callback(null, result)
	}

	Marta.prototype.getTime("Midtown", "North", function logResult(err, result) {
	   	test.equal(err, null, "Request for verse errored");
	   	test.equal(result, "10 minutes", "Correct time was not returned");  
    	test.done();
	})
};
var myMarta = new Marta();
myMarta.getTime("MIDTOWN STATION", "North", function printResult(err, result) {
	console.log('Result: ' + result)
})
module.exports = Marta