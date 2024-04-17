require('dotenv').config({path: '../.env'});

const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x62e89E72Afe98b2c8E8dAF09862A44e6e8aa3c3A"
);

module.exports = instance;
