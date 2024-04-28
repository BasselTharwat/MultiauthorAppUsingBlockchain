const web3 = require("../ethereum/web3.js");
const StoryFactory = require("./build/StoryFactory.json");

const instance = new web3.eth.Contract(
  StoryFactory.abi,
  "0xD2bEfb76aFe44aBD40D263ceB8D7e48DC18278C4"
);

module.exports = instance;
