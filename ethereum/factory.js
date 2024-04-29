const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x3113Cf1345339933AC0331086b690E1d659622Bc"
);

module.exports = instance;
