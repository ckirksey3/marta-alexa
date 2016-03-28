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

module.exports = ResponseParser