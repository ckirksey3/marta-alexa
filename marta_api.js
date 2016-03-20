
var Marta = function() {
	unirest = require('unirest')
	martaApiBaseUrl = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey="
}

Marta.prototype.makeMartaGetRequest = function (station, direction, callback) {
	responseParser = require('./marta_response_parser.js')
	api_key = ''
	// unirest.get(martaApiBaseUrl + api_key)
	// .header("X-Mashape-Key", "93O1KXOHn0mshXUKCGb7ZBUnskj0p1RC5ecjsnonegr5j8IxHb")
	// .header("Accept", "application/json")
	// .query(parameters)
	// .end(function (result) {
	//   console.log(result.status, result.headers, result.body)
	//   callback(null, result)
	// })
	response = {body:'[{"DESTINATION": "Airport","DIRECTION": "S","EVENT_TIME": "3/12/2014 5:40:28 PM", "NEXT_ARR": "05:40:37 PM"},\
		{"DESTINATION": "Midtown","DIRECTION": "N","EVENT_TIME": "3/12/2014 6:20:28 PM", "NEXT_ARR": "06:20:37 PM"},\
		{"DESTINATION": "North Avenue","DIRECTION": "N","EVENT_TIME": "3/12/2014 5:40:28 PM", "NEXT_ARR": "05:40:37 PM"}]'}
	console.log("Destination: " + station)
	console.log("Direction: " + direction)
	responseParser.prototype.getResultsByDirectionAndStation(response.body, direction, station, function getEvent(events){
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
Marta.prototype.getTime("Midtown", "North", function printResult(err, result) {
	console.log('Result: ' + result)
})
module.exports = Marta