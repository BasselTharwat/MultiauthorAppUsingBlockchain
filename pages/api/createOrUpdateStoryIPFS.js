const pinataSDK = require("@pinata/sdk");
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
import { createHelia } from "helia";
import { ipns } from '@helia/ipns';




export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        //get the template of a storyJSON 
        const storyJSON = req.body.storyJSON;
        const usernameAndPassword = req.body.usernameAndPassword;
        const pem = req.body.pem;
        
        //setup helia and the ipns module of it
        const helia = await createHelia();
        const name = ipns(helia);

        //import the key using usernameAndPassword + pem
        const keyInfo = await helia.libp2p.services.keychain.importKey(usernameAndPassword, pem, usernameAndPassword);
        //export peerId
        const peerId = await helia.libp2p.services.keychain.exportPeerId(keyInfo.name);


        //pin JSON to ipfs
        const pinataResponse = await pinata.pinJSONToIPFS(storyJSON);
        const ipfsHash = pinataResponse.IpfsHash;
        
        //publish the ipfsHash to the created ipns key
        await name.publish(peerId, ipfsHash);

        res.status(200).send("Successfully created/updated a story");

      } catch (e) {
        console.log(e);
        res.status(500).send("Server Error");
      }
    }else{
        res.status(405).send("Method Not Allowed");
    }
  }
  