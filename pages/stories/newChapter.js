import React, { useState, useRef } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import { useRouter } from 'next/router';
import web3 from '../../ethereum/web3';
import { Button, Spinner } from 'react-bootstrap';


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

        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
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

      return (
        <Layout>
            <h5>Here, you can add your new chapter. 
                You can add a text file, video, audio... you name it.</h5>
            <div>
                <input
                  type="file"
                  id="file"
                  ref={inputFile}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <Button
                    style={{marginTop:"15 px"}}
                    variant='primary'
                    disabled={uploading}
                    onClick={() => inputFile.current.click()}
                  >
                    {uploading && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                    {!uploading && "Add chapter" }
                  </Button>
                </div>
                
        </Layout>
      )
    


};

export default NewChapter;