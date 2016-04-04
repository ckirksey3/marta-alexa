
var unirest, martaApiBaseUrl

var Marta = function() {
	unirest = require('unirest')
	//Base URL for Marta API
	martaApiBaseUrl = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey="
}

/**
 * Makes request to Marta API to get estimated minutes until arrival 
 * for a specific train station and direction of travel
 * @param {String} station 
 * @param {String} direction
 * @param {Function} callback
 */
Marta.prototype.getTime = function (station, direction, callback) {
	responseParser = require('./marta_response_parser.js')
	var api_key = process.env.MARTA_API_KEY
	unirest.get(martaApiBaseUrl + api_key)
	.header("Accept", "application/json")
	.end(function (result) {
		console.log("Destination: " + station)
		console.log("Direction: " + direction)
		responseParser.prototype.getResultsByDirectionAndStation(result.body, direction, station, function getEvent(events){
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

/**
 * Makes request to Marta API to get a set of estimated minutes until arrival 
 * for each direction of travel for a specific train station
 * @param {String} station
 * @param {Function} callback
 */
Marta.prototype.getTimesByStation = function (station, direction, callback) {
	responseParser = require('./marta_response_parser.js')
	var api_key = process.env.MARTA_API_KEY
	unirest.get(martaApiBaseUrl + api_key)
	.header("Accept", "application/json")
	.end(function (result) {
		console.log("Destination: " + station)
		console.log("Direction: " + direction)
		responseParser.prototype.getResultsByStation(result.body, station, function getEvent(events){
			if(events.length > 0) {
				results = []
				events.forEach(function(event) {
					responseParser.prototype.getArrivalTimeFromEvent(event, function returnTime(err, timeOfArrival){
						if(err) {
							callback(err, null)
						} else {
							responseParser.prototype.getMinutesUntilArrival(timeOfArrival, function returnMinutesUntilArrival(err, minutesUntilArrival) {
								if(err) {
									callback(err, null)
								} else {
									results.push({direction: event.DIRECTION, minutesUntilArrival: minutesUntilArrival})
								}
							})
						}
					})
				})
				callback(null, results)
			} else {
				callback("No events found for that station/direction", null)
			}
			
		})
	  callback(err, "Failed to process train arrival times")
	})
}

module.exports = Marta