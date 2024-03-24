require('dotenv').config({path: '../.env'});

const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x77064D2f0Cd8aE8488BF1627a52Bea3CDdFeF27f"
);

module.exports = instance;
