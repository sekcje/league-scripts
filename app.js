const electron = require('electron');
const url = require('url');
const path = require('path');
const request = require('request');
const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();

const APIClient = require('./src/routes');
const Summoner = require("./src/summoner");
const Actions = require('./src/actions');
const actions = new Actions();
var LocalSummoner;
var routes;
const env = process.env.NODE_ENV;

// Extracting some stuff from electron
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain
} = electron;


// Defining global variables
let mainWindow;
let addWindow;
var userAuth;
var passwordAuth;
var requestUrl;

var clientFound = false;

function getLocalSummoner(routes) {
	if (!routes) {
		console.log("League of Legends client not found.");
	} else {
		let url = routes.Route("localSummoner");

		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: routes.getAuth()
			}
		}

		let callback = function(error, response, body) {
			LocalSummoner = new Summoner(body, routes);
		}

		request.get(body, callback);
	}
}

connector.on('connect', (data) => {
	requestUrl = data.protocol + '://' + data.address + ':' + data.port;
	routes = new APIClient(requestUrl, data.username, data.password);

	getLocalSummoner(routes);

	userAuth = data.username;
	passwordAuth = data.password;

	console.log('Request base url set to: ' + routes.getAPIBase());
	clientFound = true;
	actions.startAutoQueueAccept(routes);
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
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);


	if (env != 'dev') {
		// Loading the menu to overwrite developer tools
		Menu.setApplicationMenu(mainMenu);
	}
	

})

// Menu template
const mainMenuTemplate = [{
	label: 'File',
	submenu: []
}]

app.on('window-all-closed', () => {
	app.quit();
})

ipcMain.on('exit_app', function() {
	app.quit();
})

ipcMain.on('minimize_app', function() {
	mainWindow.minimize();
})

ipcMain.on('submitStatus', (event, status) => {
	actions.submitStatus(event, status, routes);
})

ipcMain.on('submitAvailability', (event, availability) => {
	actions.submitAvailability(event, availability, routes);
})


ipcMain.on('profileUpdate', (event) => {
	getLocalSummoner(routes);
	if (LocalSummoner) {
		event.returnValue = LocalSummoner.getProfileData();
	} else {
		event.returnValue = undefined;
	}
})

ipcMain.on('autoQueueAccept', (event, int) => {
	actions.setAutoQueueAccept(int);
})

ipcMain.on('requestVersionCheck', (event) => {
	actions.requestVersionCheck(event);
})

var searchClient = setInterval(function() {
	if (clientFound) {
		clearInterval(searchClient);
	}
	connector.start();
}, 5000)

connector.start();
