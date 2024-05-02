const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0xC637BC7f73a1aDC4e71d30A4e4496A24aA301295"
);

module.exports = instance;
