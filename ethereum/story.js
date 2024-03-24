//This creates a story instance. 
//We put this code into a file because we will use this piece
//of code many times.
/*const web3 = require("../ethereum/web3.js");
const Story = require("../ethereum/build/Story.json");
 
const story = (address) => {
  return new web3.eth.Contract(Story.abi, address);
};
module.exports = story;
*/

import web3 from "./web3";
import Story from "./build/Story.json";
 
const story = (address) => {
  return new web3.eth.Contract(Story.abi, address);
};
export default story;
