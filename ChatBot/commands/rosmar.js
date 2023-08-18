const fs = require("fs");
module.exports.config = {
	name: "rosmar",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "zach", 
	description: "ihh",
	commandCategory: "noprefix",
	usages: "rosmar",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("Rosmar")==0 || (event.body.indexOf("rosmar")==0)) {
		var msg = {
				body: "aw aw",
				attachment: fs.createReadStream(__dirname + `/noprefix/rosmar.mp3`)
			}
			api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("🐶", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }