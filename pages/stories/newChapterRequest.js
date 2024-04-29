import React, { useState, useRef } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import { useRouter } from 'next/router';
import web3 from '../../ethereum/web3.js';
import { Button, Spinner, Form } from 'react-bootstrap';

const NewChapterRequest = () => {
  const router = useRouter();
  const { asPath } = router;
  const segments = asPath.split('/'); 
  segments.pop(); 
  const address = segments.pop();
  const story = Story(address);

  const [file, setFile] = useState("");
  const [parentChapter, setParentChapter] = useState("0x0000000000000000000000000000000000000000");
  const [childChapter, setChildChapter] = useState("0x0000000000000000000000000000000000000000");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);

      //upload and pin file to ipfs using pinata
      const formData = new FormData();
      formData.append("file", fileToUpload, { filename: fileToUpload.name });
      
      // Upload the file to IPFS
      const res = await fetch("../../api/newChapterIPFS", {
        method: "POST",
        body: formData,
      });
      const ipfsHash = await res.text();
      
      const accounts = await web3.eth.getAccounts();
      const gasEstimate = await story.methods.createChapterRequest(ipfsHash, parentChapter, childChapter).estimateGas({
        from: accounts[0]
      });
      const encode = await story.methods.createChapterRequest(ipfsHash, parentChapter, childChapter).encodeABI();

      await story.methods.createChapterRequest(ipfsHash, parentChapter, childChapter).send({
        from: accounts[0],
        gas: gasEstimate.toString(),
        data: encode
      });
      

      setUploading(false);

    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading request");
    }
  };

  const inputFile = useRef(null);

  const handleFileChange = (e) => { 
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file) {
      uploadFile(file);
    } else {
      alert("Please select a file before submitting");
    }
  };

  return (
    <Layout>
      <h5>Here, you can add your new chapter. You can add a text file, video, audio... you name it.</h5>
      <br></br>

      <div>
        <Form.Group>
          <Form.Label>Parent Chapter (You must enter a parent chapter that belongs to the same story. If there is no parent chapter, leave it blank)</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter the chapter's address" 
            value={parentChapter === '0x0000000000000000000000000000000000000000' ? '' : parentChapter} 
            onChange={(e) => setParentChapter(e.target.value)} 
          />
        </Form.Group>
        <Form.Group>
          <br></br>
          <Form.Label>Child Chapter (You must enter a child chapter that belongs to the same story. If there is no child chapter, leave it blank)</Form.Label>
          <Form.Control 
          type="text" 
          placeholder="Enter the chapter's address" 
          value={childChapter === '0x0000000000000000000000000000000000000000' ? '' : childChapter} 
          onChange={(e) => setChildChapter(e.target.value)} 
        />
        </Form.Group>
        <br></br>
        <input
          type="file"
          id="file"
          ref={inputFile}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Button
          style={{ marginTop: "15px", marginRight: "10px" }}
          variant='primary'
          disabled={uploading}
          onClick={() => inputFile.current.click()}
        >
          Select File
        </Button>
        <Button
          style={{ marginTop: "15px" }}
          variant='success'
          disabled={uploading || !file}
          onClick={handleSubmit}
        >
          {uploading ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> :
            "Submit"
          }
        </Button>
      </div>
    </Layout>
  );
};

export default NewChapterRequest;
