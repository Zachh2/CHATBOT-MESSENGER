const fs = require("fs");
module.exports.config = {
	name: "ugh",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "zach", 
	description: "ihh",
	commandCategory: "noprefix",
	usages: "ugh",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("Ugh")==0 || (event.body.indexOf("ugh")==0)) {
		var msg = {
				body: ">_<",
				attachment: fs.createReadStream(__dirname + `/noprefix/ugh.mp3`)
			}
			api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😣", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }