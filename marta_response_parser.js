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
 * Filters the API results down to events for each direction of travel for a specific station
 * @param {Object} parsedResponse 
 * @param {String} station
 * @param {Function} callback
 */
ResponseParser.prototype.getResultsByStation = function (parsedResponse, station, callback) {
	filteredByStation = parsedResponse.filter(function (event) {
		return event.STATION.split(' ')[0].toLowerCase() === station.split(' ')[0].toLowerCase()
	})
	callback(filteredByStation)
}

/**
 * Returns the minutes until arrival from an API event
 * @param {Object} event
 * @param {Function} callback
 */
ResponseParser.prototype.getMinutesUntilArrivalFromEvent = function (event, callback) {
	callback(Math.round(event.WAITING_SECONDS/60))
}

/**
 * Unit tests the getResultsByDirectionAndStation function
 * execute 'nodeunit marta_response_parser.js' to run
 * @param {Object} test
 */
ResponseParser.testGetResultsByDirectionAndStation = function(test){
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

/**
 * Unit tests the getResultsByStation function
 * execute 'nodeunit marta_response_parser.js' to run
 * @param {Object} test
 */
ResponseParser.testGetResultsByStation = function(test){
	var input = [{STATION: "Airport",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"},
		{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 6:20:28 PM", NEXT_ARR: "06:20:37 PM"},
		{STATION: "Airport",DIRECTION: "N",EVENT_TIME: "3/12/2014 5:45:28 PM", NEXT_ARR: "05:45:37 PM"},
		{STATION: "Midtown",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"}];
	var parser = new ResponseParser();
	parser.getResultsByStation(input, "Airport", function logResult(result) {
	   	var expectedOutput = [{DESTINATION: "Airport",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"},
			{STATION: "Airport",DIRECTION: "N",EVENT_TIME: "3/12/2014 5:45:28 PM", NEXT_ARR: "05:45:37 PM"}]
	   	test.equal(result.length, expectedOutput.length, "Parsing function returned inaccurate number of matching events");  
	   	test.equal(result[0].EVENT_TIME, expectedOutput[0].EVENT_TIME, "First airport arrival time was not parsed correctly");  
	})
	parser.getResultsByStation(input, "Midtown", function logResult(result) {
	   	var expectedOutput = [{STATION: "Midtown",DIRECTION: "N",EVENT_TIME: "3/12/2014 6:20:28 PM", NEXT_ARR: "06:20:37 PM"},
		{STATION: "Midtown",DIRECTION: "S",EVENT_TIME: "3/12/2014 5:40:28 PM", NEXT_ARR: "05:40:37 PM"}];
	   	test.equal(result.length, expectedOutput.length, "Parsing function returned inaccurate number of matching events");  
	   	test.equal(result[0].EVENT_TIME, expectedOutput[0].EVENT_TIME, "First Midtown arrival time was not parsed correctly");  
	})
	test.done();
};

module.exports = ResponseParser