import React, { useState, useRef } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import { useRouter } from 'next/router';
import web3 from '../../ethereum/web3';


const NewChapter = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [file, setFile] = useState("");
    const [uploading, setUploading] = useState(false);

    const inputFile = useRef(null);

    const uploadFile = async (fileToUpload) => {
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", fileToUpload, { filename: fileToUpload.name });
        const res = await fetch("/api/files", {
            method: "POST",
            body: formData,
        });
        const ipfsHash = await res.text();
        console.log(ipfsHash);

        const accounts = await web3.eth.getAccounts();
        const gasEstimate = await story.methods.addChapter(ipfsHash).estimateGas({
            from: accounts[0]
        });

        const encode = await story.methods.addChapter(ipfsHash).encodeABI();

        await story.methods.addChapter(ipfsHash).send({
            from: accounts[0],
            gas: gasEstimate.toString(),
            data: encode
        });

          setUploading(false);

        console.log("appended chapter: "+ await story.methods.storyStrings(0).call());
        } catch (e) {
          console.log(e);
          setUploading(false);
          alert("Trouble uploading file");
        }
      };
    
      const handleChange = (e) => {
        setFile(e.target.files[0]);
        uploadFile(e.target.files[0]);
      };

      /*const loadRecent = async () => {
        try {
          const res = await fetch("/api/files");
          const json = await res.json();
          setCid(json.ipfs_pin_hash);
        } catch (e) {
          console.log(e);
          alert("trouble loading files");
        }
      };*/

      return (
        <Layout>
            <div>
                <input
                  type="file"
                  id="file"
                  ref={inputFile}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <button
                    disabled={uploading}
                    onClick={() => inputFile.current.click()}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                
        </Layout>
      )
    


};

export default NewChapter;