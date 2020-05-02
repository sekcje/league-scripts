const request = require('request');
var autoAcceptEnabled = false;

class actions {

	constructor() {	};

	submitStatus(event, status, routes) {
		if (!routes) return;

		let url = routes.Route("submitStatus");
		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: routes.getAuth()
			},
			json: {
				"statusMessage": status
			}
		}

		request.put(body);
	}

	submitAvailability(event, availability, routes) {
		if (!routes) return;

		let url = routes.Route("submitAvailability");
		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: routes.getAuth()
			},
			json: {
				"availability": availability
			}
		}

		request.put(body);
	}

	requestVersionCheck(event) {
		request('https://raw.githubusercontent.com/hugogomess/league-scripts/master/version.json', (error, response, body) => {
			var data = JSON.parse(body);
			event.sender.send('versions', data["league-scripts-version"], data["game-version"]);
		})
	}

	setAutoAccept(int) {
		if (int) {
			autoAcceptEnabled = true;
			console.log(autoAcceptEnabled)
		} else {
			autoAcceptEnabled = false;
			console.log(autoAcceptEnabled)
		}
	}

	autoAccept(routes) {
		var routes = routes;

		function IsJsonString(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		}
		
		setInterval(function() {
			if (!routes) return;
			let url = routes.Route("autoAccept");
			let body = {
				url: url,
				"rejectUnauthorized": false,
				headers: {
					Authorization: routes.getAuth()
				},
			}

			let callback = function(error, response, body) {
				if (!body || !IsJsonString(body)) return;
				var data = JSON.parse(body);

				if (data["state"] === "InProgress") {

					if (data["playerResponse"] === "None") {
						let acceptUrl = routes.Route("accept");
						let acceptBody = {
							url: acceptUrl,
							"rejectUnauthorized": false,
							headers: {
								Authorization: routes.getAuth()
							},
							json: {}
						}

						let acceptCallback = function(error, response, body) {}
						if (autoAcceptEnabled) {
							request.post(acceptBody, acceptCallback);
						}

					}
				}
			}
			request.get(body, callback);
		}, 1000)
	}

}

module.exports = actions;
