module.exports.config = {
  name: "join",
  eventType: ['log:subscribe'],
  version: "1.0.0",
credits: "Mirai-Team",//mod by deku
  description: "GROUP UPDATE NOTIFICATION"
};
module.exports.run = async function({ api, event, Users, Threads }) {
const fs = require("fs");
const axios = require("axios");
const request = require("request");
  function reply(data) {       api.sendMessage(data, event.threadID, event.messageID);
}
            	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? " " : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
		const fs = require("fs");
		return api.sendMessage("", event.threadID, () => api.sendMessage({body:`Connected successfully!\nThank you for using this bot, have fun using it\n\nUsage: ${global.config.PREFIX}help\nUse ${global.config.PREFIX}callad if there is an error to the Bot.. the developer will try to fix this as soon as possible.`,attachment: fs.createReadStream(__dirname + "connected.gif")} ,threadID));
            } else {
                try {
                    const {
                        threadID
                    } = event;
                    let {
                        threadName,
                        participantIDs,
                        imageSrc
                    } = await api.getThreadInfo(threadID);
                  var tn = threadName;
                  if (threadName == null){
                    var tn = "Unnamed group"
                  }
                    var threadInfo = await api.getThreadInfo(threadID);
                    var mentions = [],
                        nameArray = [],
                        memLength = [],
                        i = 0;
                    let addedParticipants1 = event.logMessageData.addedParticipants;
                    for (let newParticipant of addedParticipants1) {
                        let userID = newParticipant.userFbId
                        api.getUserInfo(parseInt(userID), (err, data) => {
                            if (err) {
                                return console.log(err)
                            }
                            var obj = Object.keys(data);
                            var userName = data[obj].name.replace("@", "");
                            if (userID !== api.getCurrentUserID()) {
                                nameArray.push(userName);
                                mentions.push({
                                    tag: userName,
                                    id: userID,
                                    fromIndex: 0
                                });
                                memLength.push(participantIDs.length - i++);
                                memLength.sort((a, b) => a - b);
                              let avt = ["https://imgur.com/jUK5zqN.png", "https://imgur.com/ksMpxt3.png", "https://imgur.com/GBXEBtZ.png", "https://imgur.com/guSjLut.png"]
   var avt1 = avt[Math.floor(Math.random() * avt.length)];
      
                                let callback = function() {
                                    return reply({
                                        body: `Hello ${nameArray}\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group.\nEnjoy!`,
                                        attachment: fs.createReadStream(`come.jpg`),
                                        mentions
                                    }, () => fs.unlinkSync(`come.jpg`));

                                };
                                request(encodeURI(`https://free-api.ainz-sama101.repl.co/canvas/welcome?uid=${userID}&name=${nameArray}&bg=${avt1}&namegc=${threadName}&member=${participantIDs.length}`))
                                    .pipe(fs.createWriteStream(`come.jpg`))
                                    .on("close", callback)
                            }
                        })
                    }
                } catch (err) {
                    return console.log("ERROR: " + err);
                }
                                }
}