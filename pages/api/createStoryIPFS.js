const pinataSDK = require("@pinata/sdk");
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
import { createHelia } from "helia";
import { ipns } from '@helia/ipns';
require('dotenv').config({path: '../.env'});




export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        const storyJSON = req.body;
        console.log(storyJSON);
        //setup helia and the ipns module of it
        const helia = await createHelia();
        const name = ipns(helia);

        //pin json to pinata
        const pinataResponse = await pinata.pinJSONToIPFS(storyJSON);

        console.log("pinata response: ", pinataResponse.IpfsHash);

        storyJSON.previousStoryHashes.push(pinataResponse.IpfsHash);

        //create an ipns hash of the story
        const keyInfo = await helia.libp2p.services.keychain.createKey(storyJSON.storyAddress,"secp256k1",4096);
        const peerId = await helia.libp2p.services.keychain.exportPeerId(keyInfo.name);
        
        //publish the pinned ipfs to the created ipns key
        await name.publish(peerId, pinataResponse.IpfsHash);
        
        const result = await name.resolve(peerId);
        const ipnsHash = result.cid;
        console.log("ipns hash:",ipnsHash);

        res.status(200).send("Successfully created a story");

      } catch (e) {
        console.log(e);
        res.status(500).send("Server Error");
      }
    }else{
        res.status(405).send("Method Not Allowed");
    }
  }
  