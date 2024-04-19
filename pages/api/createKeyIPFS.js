import { createHelia } from "helia";
import { ipns } from '@helia/ipns';
const generator = require('generate-password');



export default async function handler(req, res) {
    if (req.method === "POST") {
      try {
        //generate a random password+username
        const usernameAndPassword = generator.generate({
          length: 12, 
          numbers: true, 
          symbols: false, 
          uppercase: true,
          lowercase: true 
          });


        //setup helia and the ipns module of it
        const helia = await createHelia();

        //create an ipns hash of the story
        const keyInfo = await helia.libp2p.services.keychain.createKey(usernameAndPassword, "secp256k1", 4096);
        const pem = await helia.libp2p.services.keychain.exportKey(usernameAndPassword, usernameAndPassword);
        //const peerId = await helia.libp2p.services.keychain.exportPeerId(keyInfo.name);
        
        

        const credentials = {"usernameAndPassword":usernameAndPassword,
                            "pem":pem};

        res.status(200).json(credentials);
        

      } catch (e) {
        console.log(e);
        res.status(500).send("Server Error");
      }
    }else{
        res.status(405).send("Method Not Allowed");
    }
  }
  