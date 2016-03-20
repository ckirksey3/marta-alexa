var Marta = function() {
	unirest = require('unirest')
	martaApiBaseUrl = ""
}

Marta.prototype.makeMartaGetRequest = function (method, parameters, callback) {
	unirest.get(martaApiBaseUrl + "/" + method)
	.header("X-Mashape-Key", "93O1KXOHn0mshXUKCGb7ZBUnskj0p1RC5ecjsnonegr5j8IxHb")
	.header("Accept", "application/json")
	.query(parameters)
	.end(function (result) {
	  console.log(result.status, result.headers, result.body)
	  callback(null, result)
	})
}

Marta.prototype.getTime = function (station, direction, callback) {
	var parameters = {
		Station: station,
		Direction: direction,
	}
	this.makeMartaGetRequest("GetFromTwoVerses", parameters, function parseResponse(error, result) {
		console.log("getPass returned")
		//remove verse numbers
		var martaText = result.body.Output;

		//handle error
		if(martaText == "error") {
			martaText = "Either I misheard you or that station does not exist."
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

	Marta.prototype.getPassage("Midtown", "North", function logResult(err, result) {
	   	test.equal(err, null, "Request for verse errored");
	   	test.equal(result, "10 minutes", "Correct time was not returned");  
    	test.done();
	})
};

module.exports = Marta