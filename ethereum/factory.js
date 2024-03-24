require('dotenv').config({path: '../.env'});

const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0x0EBA814C9437F1671dcbBA017B7C0551dbf4A626"
);

module.exports = instance;
