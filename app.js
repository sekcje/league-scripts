var electron = require('electron')
var url = require('url')
var path = require('path')
var request = require('request')
var LCUConnector = require('lcu-connector')
var connector = new LCUConnector()

var APIClient = require("./src/routes")
var Summoner = require("./src/summoner")
var LocalSummoner
var routes
const env = process.env.NODE_ENV;

// Setting default settings
var autoAccept_enabled = false

// Extracting some stuff from electron
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain
} = electron


// Defining global variables
let mainWindow
let addWindow
var userAuth
var passwordAuth
var requestUrl

var clientFound = false;

function getLocalSummoner() {

	if (!routes) {
		console.log("League of Legends client not found.");
	} else {
		let url = routes.Route("localSummoner")

		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: routes.getAuth()
			}
		}

		let callback = function(error, response, body) {
			LocalSummoner = new Summoner(body, routes)
		}

		request.get(body, callback)
	}
}

connector.on('connect', (data) => {
	requestUrl = data.protocol + '://' + data.address + ':' + data.port
	routes = new APIClient(requestUrl, data.username, data.password)

	getLocalSummoner()

	userAuth = data.username
	passwordAuth = data.password

	console.log('Request base url set to: ' + routes.getAPIBase())
	clientFound = true;
})

// Listen for the app to be ready
app.on('ready', function() {

	// Creating main window of the app
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		resizable: false,
		movable: true,
		icon: path.join(__dirname, 'images/icon.png'),
		webPreferences: { nodeIntegration: true }
	})

	// Load HTML file into the window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, './app/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// Building Menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)


	if (env != 'dev') {
		// Loading the menu to overwrite developer tools
		Menu.setApplicationMenu(mainMenu)
	}
	

})

// Menu template
const mainMenuTemplate = [{
	label: 'File',
	submenu: []
}]

app.on('window-all-closed', () => {
	app.quit()
})

ipcMain.on('exit_app', function() {
	app.quit()
})

ipcMain.on('minimize_app', function() {
	mainWindow.minimize()
})

ipcMain.on('submitStatus', (event, status) => {
	if (!routes) return;

	let url = routes.Route("submitStatus")
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

	request.put(body)

})

ipcMain.on('submitAvailability', (event, availability) => {
	if (!routes) return;

	let url = routes.Route("submitAvailability")
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

	request.put(body)

})


ipcMain.on('profileUpdate', (event) => {
	getLocalSummoner()
	if (LocalSummoner) {
		event.returnValue = LocalSummoner.getProfileData();
	} else {
		event.returnValue = undefined;
	}
})

ipcMain.on('autoAccept', (event, int) => {
	if (int) {
		autoAccept_enabled = true
	} else {
		autoAccept_enabled = false
	}
})

function IsJsonString(str) {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}

var autoAccept = function() {
	setInterval(function() {
		if (!routes) return;

		let url = routes.Route("autoAccept")
		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: routes.getAuth()
			},
		}

		let callback = function(error, response, body) {
			if (!body || !IsJsonString(body)) return
			var data = JSON.parse(body)

			if (data["state"] === "InProgress") {

				if (data["playerResponse"] === "None") {
					let acceptUrl = routes.Route("accept")
					let acceptBody = {
						url: acceptUrl,
						"rejectUnauthorized": false,
						headers: {
							Authorization: routes.getAuth()
						},
						json: {}
					}

					let acceptCallback = function(error, response, body) {}

					if (autoAccept_enabled) {
						request.post(acceptBody, acceptCallback)
					}

				}
			}
		}

		request.get(body, callback)
	}, 1000)
}

autoAccept()

ipcMain.on('requestVersionCheck', (event) => {
	request('https://raw.githubusercontent.com/hugogomess/league-scripts/master/version.json', (error, response, body) => {
		var data = JSON.parse(body)
		event.sender.send('versions', data["league-scripts-version"], data["game-version"])
	})
})

var searchClient = setInterval(function() {
	if (clientFound) {
		clearInterval(searchClient);
	}
	connector.start();
}, 5000)

connector.start();
