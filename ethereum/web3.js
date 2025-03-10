require('dotenv').config({path: '../.env'});

const { Web3 } = require("web3");


let web3;
 
if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  const ethereum = window.ethereum;
  // Listen for account changes
  ethereum.on('accountsChanged', function (accounts) {
    window.location.href = 'http://localhost:3000';
    
  });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider( //this is how we create our own provider
  process.env.INFURA_URL
  ); 
  web3 = new Web3(provider);
}
 


module.exports = web3;