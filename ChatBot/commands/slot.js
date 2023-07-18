module.exports.config = {
    name: "slot",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "zach",
    description: "Gambling in the form of cunt",
    commandCategory: "games",
    usages: "[number of coins to place]",
    cooldowns: 10,
};

module.exports.run = async function({ api, event, args, Currencies }) {
    const slotItems = ["😂", "☺️", "🤤", "🤑", "🥱", "🥰", "😋", "🥳", "😭", "🥺", "😱", "🤬"];
    const moneyUser = (await Currencies.getData(event.senderID)).money;
    var moneyBet = parseInt(args[0]);
    if (isNaN(moneyBet) || moneyBet <= 0) return api.sendMessage("[ 🎲game ] Bet amount cannot be empty or negative amount", event.threadID, event.messageID);
	if (moneyBet > moneyUser) return api.sendMessage("[ 🎲game ] The amount you bet is bigger than your balance!", event.threadID, event.messageID);
	if (moneyBet < 10) return api.sendMessage("[ 🎲game ] Deposit amount should not be less than 20$!", event.threadID, event.messageID);
  if (moneyBet > 50) return api.sendMessage("[ 🎲game ] The amount of ₱ set cannot be more than 50₱!", event.threadID, event.messageID);    
    var number = [], win = false;
    for (i = 0; i < 4; i++) number[i] = Math.floor(Math.random() * slotItems.length);
    if (number[0] == number[1] && number[1] == number[2] || number[0] == number[1] && number[1] == number[3] || number[0] == number[1] && number[2] == number[3]) {
        moneyBet *= 9;
        win = true;
    }
    else if (number[0] == number[1] || number[0] == number[2] || number[0] == number[3] || number[1] == number[2] || number[1] == number[3] || number[2] == number[3]) {
        moneyBet *= 0.2;
        win = true;
    }
    switch (win) {
        case true: {
            api.sendMessage(`🎭 » ${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]} | ${slotItems[number[3]]} « 🎭\nYou won with ${moneyBet}$ `, event.threadID, event.messageID);
            await Currencies.increaseMoney(event.senderID, moneyBet);
            break;
        }
        case false: {
            api.sendMessage(`🎭 » ${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]} | ${slotItems[number[3]]} « 🎭\nYou lost and lost ${moneyBet}$ `, event.threadID, event.messageID);
            await Currencies.decreaseMoney(event.senderID, moneyBet);
            break;
        }
    }
}