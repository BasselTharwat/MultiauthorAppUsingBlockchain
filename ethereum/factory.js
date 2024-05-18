const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x5f900A6Df3c57f9b45EFE8799aD2C759b682aE7F"
);

module.exports = instance;
