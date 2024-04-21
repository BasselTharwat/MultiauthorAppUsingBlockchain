import fetch from 'node-fetch';
import { createHelia } from "helia";
import { ipns } from '@helia/ipns';



export default async function handler(req, res) {
    if (req.method === "POST") {
      try { 
        const usernameAndPassword = req.body.usernameAndPassword;
        const pem = req.body.pem;
        
        //setup helia and the ipns module of it
        const helia = await createHelia();
        const name = ipns(helia);

        //import the key using usernameAndPassword + pem
        const keyInfo = await helia.libp2p.services.keychain.importKey(usernameAndPassword, pem, usernameAndPassword);
        //export peerId
        const peerId = await helia.libp2p.services.keychain.exportPeerId(keyInfo.name);
        
        
        const result = await name.resolve(peerId);
        const ipnsHash = result.cid;
        

        const controller = new AbortController()
        // many minutes timeout:
        const timeoutId = setTimeout(() => controller.abort(), 5000000)

        // Fetch the storyJSON from the IPFS gateway
        const url = `https://gateway.ipfs.io/ipfs/${ipnsHash}`;
        const response = await fetch(url, {signal: controller.signal});
        if (!response.ok) {
            throw new Error(`Failed to fetch storyJSON from ${url}`);
        }
        const storyJSON = await response.json();

        res.status(200).json(storyJSON);
    
      } catch (e) {
        console.log(e);
        res.status(500).send("Server Error");
      }
    }else{
        res.status(405).send("Method Not Allowed");
    }
  }
  