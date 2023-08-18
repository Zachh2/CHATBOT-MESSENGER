module.exports.config = {
	name: "leaveNoti",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "Deku",
	description: "Notify left members",
	dependencies: {
		"fs-extra": "",
		"path": ""
	}
};

module.exports.run = async function({ api, event, Users, Threads }) {
const fs = require("fs");
const axios = require("axios");
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
function reply(data) {
        api.sendMessage(data, event.threadID, event.messageID);
          }
          let {threadName, participantIDs, imageSrc} = await api.getThreadInfo(event.threadID);
            const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "kicked by Admin of the group";
          let pathh = __dirname+`/cache/bye.png`;
          let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name
          let avt = ["https://i.imgur.com/cnaWCS3.jpg", "https://i.imgur.com/jEzp4CW.jpg", "https://i.imgur.com/kHALOpg.jpg", "https://i.imgur.com/wnRis0C.jpg"]
   var avt1 = avt[Math.floor(Math.random() * avt.length)];
  //https://free-api.ainz-sama101.repl.co/canvas/goodbye2?name=Mark%20Zuckerberg&uid=4&bg=https://i.imgur.com/b2mRO70.jpg&member=69
         let image = (
    await axios.get(`https://free-api.ainz-sama101.repl.co/canvas/goodbye2?name=${name}&uid=${event.logMessageData.leftParticipantFbId}&bg=${avt1}.png&member=${participantIDs.length}`, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(pathh, Buffer.from(image, "utf-8"));
  /*reply("Sayonara :<\n"+name+" has been "+type+"\n\nMember’s left: "+participantIDs.length)*/
            reply({body:name+" has been " + type+"\nMember’s left: "+participantIDs.length, attachment: fs.createReadStream(pathh)})
            }