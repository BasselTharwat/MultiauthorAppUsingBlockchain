import React, { useState, useRef } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story';
import { useRouter } from 'next/router';
import web3 from '../../ethereum/web3';
import { Button, Spinner } from 'react-bootstrap';
import { useGlobalState } from '../../context/storyJSONContext.js';


const NewChapter = () => {
  const router = useRouter();
  const { asPath } = router;
  const segments = asPath.split('/'); 
  segments.pop(); 
  const address = segments.pop();
  const story = Story(address);

  const [file, setFile] = useState("");
  const [uploading, setUploading] = useState(false);

  const { storyJSON, setStoryJSON } = useGlobalState();

  const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);


      // Fetch credentials
      const found = await story.methods.getSummary().call(); 
      //upload and pin file to ipfs using pinata
      const formData = new FormData();

      const controller = new AbortController()
      // many minutes timeout:
      const timeoutId = setTimeout(() => controller.abort(), 5000000);


      formData.append("file", fileToUpload, { filename: fileToUpload.name });
      const res = await fetch("../../api/newChapterIPFS", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      const ipfsHash = await res.text();

      //update the storyJSON state
      const updatedStoryJSON = storyJSON.chapters.push({"cid":ipfsHash,
                                                        "timestamp": Date.now()});
      setStoryJSON(updatedStoryJSON);


      //update the json on the ipfs
      await fetch("../../api/createOrUpdateStoryIPFS",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({usernameAndPassword: found[2],
            pem: found[3],
            storyJSON: storyJSON}),
        signal: controller.signal
          });





      setUploading(false);

    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };
  

  const inputFile = useRef(null);

  const handleChange = (e) => { 
    setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  return (
    <Layout>
      <h5>Here, you can add your new chapter. You can add a text file, video, audio... you name it.</h5>
      <div>
        <input
          type="file"
          id="file"
          ref={inputFile}
          onChange={handleChange}
          style={{ display: "none" }}
        />
        <Button
          style={{ marginTop: "15px" }}
          variant='primary'
          disabled={uploading}
          onClick={() => inputFile.current.click()}
        >
          {uploading ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> :
            "Add chapter"
          }
        </Button>
      </div>
    </Layout>
  );
};

export default NewChapter;
