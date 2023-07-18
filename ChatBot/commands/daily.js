module.exports.config = {
	name: "daily",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "zach",
	description: "200 coins ",
	commandCategory: "games",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 1000000,
        rewardCoin: 200
    }
};

module.exports.languages = {
    "vi": {
        "cooldown": "Bạn đang trong thời gian chờ\nVui lòng thử lại sau: %1 giờ %2 phút %3 giây!",
        "rewarded": "Bạn đã nhận %1$, để có thể tiếp tục nhận, vui lòng quay lại sau 12 tiếng"
    },
    "en": {
        "cooldown": "You received daily rewards, please come back after: %1 minutes %2 seconds.",
        "rewarded": "You received %1₱, to continue to receive, please try again after 60 mins"
    }
}

module.exports.run = async ({ event, api, Currencies, getText }) => {
    const { daily } = global.configModule,
        cooldownTime = daily.cooldownTime,
        rewardCoin = daily.rewardCoin;

    var { senderID, threadID } = event;

    let data = (await Currencies.getData(senderID)).data || {};
    if (typeof data !== "undefined" && cooldownTime - (Date.now() - (data.dailyCoolDown || 0)) > 0) {
        var time = cooldownTime - (Date.now() - data.dailyCoolDown),
            seconds = Math.floor( (time/1000) % 60 ),
            minutes = Math.floor( (time/1000/60) % 60 );

		return api.sendMessage(getText("cooldown", minutes, (seconds < 10 ? "0" : "") + seconds), threadID);
    }

    else return api.sendMessage(getText("rewarded", rewardCoin), threadID, async () => {
        await Currencies.increaseMoney(senderID, rewardCoin);
        data.dailyCoolDown = Date.now();
        await Currencies.setData(senderID, { data });
        return;
    });
      }