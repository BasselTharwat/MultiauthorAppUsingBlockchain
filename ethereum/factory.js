const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x3307cef733BD37dfA4C16D92BAE6B6Bd9ceBc3a9"
);

module.exports = instance;
