const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x63734F6f41D7e69bBc28dCB465459fb37dB38bC1"
);

module.exports = instance;
