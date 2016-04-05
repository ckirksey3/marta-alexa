
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
	var api_key = "30e67a92-f98d-410d-a511-5a3233d838f2"//process.env.MARTA_API_KEY
	unirest.get(martaApiBaseUrl + api_key)
	.header("Accept", "application/json")
	.end(function (result) {
		console.log("Destination: " + station)
		console.log("Direction: " + direction)
		responseParser.prototype.getResultsByDirectionAndStation(result.body, direction, station, function getEvent(events){
			if(events.length > 0) {
				responseParser.prototype.getMinutesUntilArrivalFromEvent(events[0], function returnTime(minutes){
					callback(null, minutes)
				})
			} else {
				callback("No events found for that station/direction", null)
			}
		})
	})
}

/**
 * Makes request to Marta API to get a set of estimated minutes until arrival 
 * for each direction of travel for a specific train station
 * @param {String} station
 * @param {Function} callback
 */
Marta.prototype.getTimesByStation = function (station, callback) {
	responseParser = require('./marta_response_parser.js')
	var api_key = "30e67a92-f98d-410d-a511-5a3233d838f2"//process.env.MARTA_API_KEY
	unirest.get(martaApiBaseUrl + api_key)
	.header("Accept", "application/json")
	.end(function (result) {
		console.log("Destination: " + station)
		responseParser.prototype.getResultsByStation(result.body, station, function getEvent(events){
			if(events.length > 0) {
				results = []
				events.forEach(function(event) {
					responseParser.prototype.getMinutesUntilArrivalFromEvent(event, function returnTime(minutes){
						results.push({direction: event.DIRECTION, minutesUntilArrival: minutes})
					})
				})
				callback(null, results)
			} else {
				callback("No events found for that station/direction", null)
			}
		})
	})
}

module.exports = Marta