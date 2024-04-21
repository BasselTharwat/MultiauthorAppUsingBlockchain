const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x76De4795B7e23D98c31E86A0308931b8a8CDf58A"
);

module.exports = instance;
