const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x2AfFb89bBE0638F2F06042Da8e4cFC207ae2325a"
);

module.exports = instance;
