require('dotenv').config({path: '../.env'});

const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x171F5DA32fE1c46CDe387a57e74d880b22A18409"
);

module.exports = instance;
