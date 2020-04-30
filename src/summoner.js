class summoner {

	constructor(data, APIRoutes) {
		// Modules
		this.request = require("request");

		// class data

		if (!this.IsJsonString(data)) return;
		data = JSON.parse(data)
		this.APIRoutes = APIRoutes;
		this.level = this.level || data.summonerLevel;
		this.name = this.name || data.displayName;
		this.ID = this.ID || data.summonerId;
		this.iconID = this.iconID || data.profileIconId;
	}

	IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	getProfileData() {
		let arr = {
			name: this.name,
			iconID: this.iconID,
			level: this.level
		}
		return arr
	}
}

module.exports = summoner;
