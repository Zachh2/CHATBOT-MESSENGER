module.exports.config={
name:"prefix1",
version:"1.0.0",
  hasPermssion:0,
  credits:"ManhG",
  description:"See the prefix of BOT",
commandCategory:"Noprefix",
  usages:"",
  cooldowns:5
},
module.exports.handleEvent=async({event:e,api:a,Threads:n})=>{var{threadID:o,messageID:r,body:s,senderID:t}=e;if("ManhG"!=this.config.credits)return a.sendMessage("Sai credits!",o,r);function i(e){a.sendMessage(e,o,r)}var d=(await n.getData(o)).data;const p=global.data.threadData.get(parseInt(o))||{};["Prefix","prefix","ano prefix","prefx","anong prefix","prefix nito?"].forEach((e=>{let a=e[0].toUpperCase()+e.slice(1);if(s===e.toUpperCase()|s===e|a===s){const e=p.PREFIX||global.config.PREFIX;return null==d.PREFIX?i(`The current preset is [ ${e} ] `):i("The group's preset is: "+d.PREFIX)}}))},module.exports.run=async({event:e,api:a})=>a.sendMessage("( \\_/)                                                                            ( •_•)                                                                            // >🧠                                                            Give me your brain and I put it in your head.\nDo you know if it's the Noprefix command??",e.threadID);
