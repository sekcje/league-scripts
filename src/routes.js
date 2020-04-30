class routes {

  constructor(base, username, password) {
    if (!base) throw "Invalid base URL..";
    if (!username) throw "Invalid username..";
    if (!password) throw "Invalid password..";
    // Modules
    this.request = require("request");

    // class data
    this.base = base;
    this.username = username;
    this.password = password;
    this.routes = {
      lolchatv1me: "/lol-chat/v1/me",
      lolmatchmakingv1readycheck: "/lol-matchmaking/v1/ready-check",
      lolmatchmakingv1readycheckaccept: "/lol-matchmaking/v1/ready-check/accept",
      lolsummonerv1currentsummoner: "/lol-summoner/v1/current-summoner",
    }
    this.alias = {
      // lolchatv1me
      submitStatus: this.routes["lolchatv1me"],
      submitAvailability: this.routes["lolchatv1me"],
      submitIcon: this.routes["lolchatv1me"],

      // lolmatchmakingv1readycheck
      autoAccept: this.routes["lolmatchmakingv1readycheck"],
      accept: this.routes["lolmatchmakingv1readycheckaccept"],

      // lolsummonerv1currentsummoner
      localSummoner: this.routes["lolsummonerv1currentsummoner"]
    }
  }

  setAPIBase(base) {
    this.base = base;
  }

  getAPIBase() {
    return this.base;
  }

  get(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.get(body, callback);
  }

  post(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.post(body, callback);
  }

  put(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.put(body, callback);
  }

  getAuth() {
    return "Basic " + (new Buffer(this.username + ":" + this.password).toString("base64"));
  }

  Route(alias, id) {
    let route = id ? this.alias[alias](this, id) : this.alias[alias];
    if (!route) throw "Invalid alias.";
    //console.log("Route is: " + route)
    return this.base + route;
  }
}

module.exports = routes;