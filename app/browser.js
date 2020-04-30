const version = require('../version.json');
var currentVersion = version['league-scripts-version'];
var gameVersion = version['game-version'];
var repository = "https://github.com/hugogomess/league-scripts";

const electron = require('electron');
const {	ipcRenderer } = electron;

var isActive;

var level;
var icon;
var summoner;

function submitStatus() {
	status = document.getElementById("status").value;
	ipcRenderer.send('submitStatus', status)
}

function submitAvailability() {
	availability = document.getElementById("availability").value
	ipcRenderer.send('submitAvailability', availability)
}

function submitIcon() {
	icon = document.getElementById("icon").value;
	ipcRenderer.send('submitIcon', icon);
	document.getElementById("profileSummonerIcon").src = "http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/profileicon/" + (icon) + ".png";
}

function exit_app() {
	ipcRenderer.send('exit_app');
}

function minimize_app() {
	ipcRenderer.send('minimize_app');
}

let clientIcon;

async function profileUpdate() {
	let data;

	try {
		data = ipcRenderer.sendSync("profileUpdate");

		if (!data) return;

		if (clientIcon) {
			if (clientIcon !== data.iconID) {
				document.getElementById("profileSummonerIcon").src = "http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/profileicon/" + data.iconID + ".png";
				clientIcon = data.iconID;
			}
		} else {
			clientIcon = data.iconID;
			let profileLevel = (data.level) || "";

			document.getElementById("profileName").innerHTML = summoner || data.name;
			document.getElementById("profileLevel").innerHTML = level || profileLevel;
			document.getElementById("profileSummonerIcon").src = "http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/profileicon/" + (icon || data.iconID || "1") + ".png";
		}
		

	} catch (e) {
		console.log("And error occured updating the profile information: " + e);
	}
}

// SECTIONS

function openTab(evt, tabName) {
	// Declare all variables
	var i, tabcontent, tablinks

	if (tabName == "Home") {
		document.getElementById("selected").style.marginLeft = "0px"
	}

	if (tabName == "Profile") {
		document.getElementById("selected").style.marginLeft = "120px"
	}

	if (tabName == "Champ Select") {
		document.getElementById("selected").style.marginLeft = "278px"
	}

	if (tabName == "Scripts") {
		document.getElementById("selected").style.marginLeft = "435px"
	}

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent")
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none"
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks")
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "")
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(tabName).style.display = "block"
	evt.currentTarget.className += " active"
}


// Event listeners

function autoUpdate() {
	isActive = true
	setTimeout(function() {
		setInterval(function() {
			if (!isActive) return
			profileUpdate()
		}, 5000)
		profileUpdate();
	}, 2000)
}

window.addEventListener("load", autoUpdate, false)


window.onfocus = function() {
	isActive = true
}

window.onblur = function() {
	isActive = false
}

function toggleAutoAccept(element) {
	if (element.checked) {
		ipcRenderer.send('autoAccept', true)
	} else {
		ipcRenderer.send('autoAccept', false)
	}
}


ipcRenderer.send('requestVersionCheck')
setInterval(function() {
	ipcRenderer.send('requestVersionCheck')
}, 30000)


function openGithub() {
	ipcRenderer.send('openGitRepository');
}

ipcRenderer.on('versions', (event, appVersion, leagueGameVersion) => {
	gameVersion = leagueGameVersion;
	let versionElement = document.getElementById("version-tag");

	if (appVersion == currentVersion) {
		versionElement.innerHTML = "V" + currentVersion + " (latest)";
	} else if (appVersion > currentVersion) {
		versionElement.innerHTML = "V" + currentVersion + " (update available)";
	} else if (appVersion < currentVersion) {
		versionElement.innerHTML = "V" + currentVersion + " (beta)";
	}
})
