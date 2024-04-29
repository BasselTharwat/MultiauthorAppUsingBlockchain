const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x0c158eE7373fb79010c4FFe70A0398f20ABA3b34"
);

module.exports = instance;
