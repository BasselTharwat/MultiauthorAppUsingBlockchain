const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x9EE110968D82Abd71C526373EA2fe4B683FcBDcA"
);

module.exports = instance;
