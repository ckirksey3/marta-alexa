var ResponseParser = function() {}

/**
 * Filters the API results down to the event for a specific station and train direction
 * @param {Object} parsedResponse 
 * @param {String} station 
 * @param {String} direction
 * @param {Function} callback
 */
ResponseParser.prototype.getResultsByDirectionAndStation = function (parsedResponse, direction, station, callback) {
	filteredByDirection = parsedResponse.filter(function (event) {
		//only use the first word of the station name and convert to lower case 
		//to improve chance of a successful match
		return event.DIRECTION.split(' ')[0].toLowerCase() === direction[0].split(' ')[0].toLowerCase()
	})
	filteredByDirectionAndStation = parsedResponse.filter(function (event) {
		return event.STATION.split(' ')[0].toLowerCase() === station.split(' ')[0].toLowerCase()
	})
	callback(filteredByDirectionAndStation)
}

/**
 * Returns the arrival time from an API event as a JavaScript Date object
 * @param {Object} event
 * @param {Function} callback
 */
ResponseParser.prototype.getArrivalTimeFromEvent = function (event, callback) {
	time = event.NEXT_ARR.split(/[\s:]+/)
	date = event.EVENT_TIME.split(/[\/\s]+/)
	isPM = (time[3] == 'PM') ? 12:0
	month = parseInt(date[0]) - 1
	day = parseInt(date[1])
	year = parseInt(date[2])
	hour = parseInt(time[0]) + isPM
	minute = parseInt(time[1])
	second = parseInt(time[2])
	millisecond = 0
	callback(null, new Date(year, month, day, hour, minute, second, millisecond))
}

/**
 * Calculates the minutes between the estimated arrival time and current time
 * @param {Date} time
 * @param {Function} callback
 */
ResponseParser.prototype.getMinutesUntilArrival = function (time, callback) {
	now = new Date()
	callback(null, time.getUTCMinutes() - now.getUTCMinutes())
}

/**
 * Unit tests the getResultsByDirectionAndStation function
 * execute 'nodeunit marta_response_parser.js' to run
 * @param {Object} test
 */
ResponseParser.testGetTime = function(test){
	var input = [{STATION: "Airport",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"},
		{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 6:20:28 PM", NEXT_ARR: "06:20:37 PM"},
		{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"}];
	var parser = new ResponseParser();
	parser.getResultsByDirectionAndStation(input, "S", "Airport", function logResult(result) {
	   	var expectedOutput = [{DESTINATION: "Airport",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"}]
	   	test.equal(result.length, expectedOutput.length, "Parsing function returned inaccurate number of matching events");  
	   	test.equal(result[0].EVENT_TIME, expectedOutput[0].EVENT_TIME, "Airport arrival time was not parsed correctly");  
	})
	parser.getResultsByDirectionAndStation(input, "N", "Midtown", function logResult(result) {
	   	var expectedOutput = [{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 6:20:28 PM", NEXT_ARR: "06:20:37 PM"},
		{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"}];
	   	test.equal(result.length, expectedOutput.length, "Parsing function returned inaccurate number of matching events");  
	   	test.equal(result[0].EVENT_TIME, expectedOutput[0].EVENT_TIME, "First Midtown arrival time was not parsed correctly");  
	})
	test.done();
};

module.exports = ResponseParser