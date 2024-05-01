const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x54783B70CeAE9B7F7c52b6d75409214cA2FCF35C"
);

module.exports = instance;
