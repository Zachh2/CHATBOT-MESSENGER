module.exports.config = {
  name: "rps", // name of the command
  version: "1.0.0", // version of the command
  hasPermssion: 0, // command permission, 0: all, 1: group admins, 2: bot admins
  credits: "Anjelo Cayao Arabis", // The owner of this command
  description: "Play rock-paper-scissors game", // Describe command here
  commandCategory: "Games",
  usages: "[rock/paper/scissors]", // How to use this command? describe here
  cooldowns: 3, // Cooldown till next use
  dependencies: {}, // Dependencies need for command
  additionalConfig: {
    // Setup command config here
  }
};

module.exports.onLoad = function ({ configValue }) {
  // CODE HERE
};

module.exports.handleReaction = function({ api, event, models, Users, Threads, Currencies, handleReaction }) {
  // CODE HERE
};

module.exports.handleReply = function({ api, event, models, Users, Threads, Currencies, handleReply }) {
  // CODE HERE
};

module.exports.handleEvent = function({ event, api, models, Users, Threads, Currencies }) {
  // CODE HERE
};

module.exports.run = function({ api, event, args, models, Users, Threads, Currencies, permssion }) {
  const choices = ["rock", "paper", "scissors"];
  const playerChoice = args[0];
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  
  if (!playerChoice || !choices.includes(playerChoice)) {
    api.sendMessage(`Please enter a valid choice: ${choices.join(", ")}.\nexample ${global.config.PREFIX}rps rock`, event.threadID);
    return;
  }
  
  api.sendMessage(`You chose ${playerChoice}. I chose ${botChoice}.`, event.threadID);
  
  if (playerChoice === botChoice) {
    api.sendMessage("It's a tie!", event.threadID);
    return;
  }
  
  if (
    (playerChoice === "rock" && botChoice === "scissors") ||
    (playerChoice === "paper" && botChoice === "rock") ||
    (playerChoice === "scissors" && botChoice === "paper")
  ) {
    api.sendMessage("You win!", event.threadID);
    return;
  }
  
  api.sendMessage("I win!", event.threadID);
};
