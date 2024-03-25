require('dotenv').config({path: '../.env'});

const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0xc7C82EF52779662b5592f423f94e6Ab78747f701"
);

module.exports = instance;
