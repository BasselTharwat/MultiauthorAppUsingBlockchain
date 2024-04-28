import web3 from "./web3";
import Chapter from "./build/Chapter.json";
 
const chapter = (address) => {
  return new web3.eth.Contract(Chapter.abi, address);
};
export default chapter;