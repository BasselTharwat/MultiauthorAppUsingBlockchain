import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import Chapter from '../../ethereum/chapter.js';
import { useRouter } from 'next/router';
import web3 from '../../ethereum/web3.js';
import { Button, Spinner, Form, Card, Dropdown } from 'react-bootstrap';
import RenderGraph from '../../components/renderGraph.js';

const NewChapter = ({storyAddress}) => {
  const story = Story(storyAddress);

  const router = useRouter();

  const [file, setFile] = useState("");
  const [parentChapter, setParentChapter] = useState("0x0000000000000000000000000000000000000000");
  const [childChapter, setChildChapter] = useState("0x0000000000000000000000000000000000000000");
  const [chapterTitle, setChapterTitle] = useState(""); 
  const [uploading, setUploading] = useState(false);
  const [childChapterLabel, setChildChapterLabel] = useState("");
  const [parentChapterLabel, setParentChapterLabel] = useState("");

  const [isClient, setIsClient] = useState(false);
  const [allChapters, setAllChapters] = useState([]);

  const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);

      //upload and pin file to ipfs using pinata
      const formData = new FormData();
      formData.append("file", fileToUpload, { filename: fileToUpload.name });
      
      // Upload the file to IPFS
      const res = await fetch("../../api/addToIPFS", {
        method: "POST",
        body: formData,
      });
      const ipfsHash = await res.text();
      
      const accounts = await web3.eth.getAccounts();
      const gasEstimate = await story.methods.createChapter(chapterTitle, ipfsHash, parentChapter, childChapter).estimateGas({
        from: accounts[0]
      });
      const encode = await story.methods.createChapter(chapterTitle, ipfsHash, parentChapter, childChapter).encodeABI();

      await story.methods.createChapter(chapterTitle, ipfsHash, parentChapter, childChapter).send({
        from: accounts[0],
        gas: gasEstimate.toString(),
        data: encode
      });
      

      setUploading(false);
      setChapterTitle("");
      setChildChapter("0x0000000000000000000000000000000000000000");
      setParentChapter("0x0000000000000000000000000000000000000000");

      router.reload();

      

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
      if(childChapter !="0x0000000000000000000000000000000000000000" && childChapter === parentChapter){
        alert("A chapter can not have the same parent and child chapters")
      }
      else{
      uploadFile(file);
      }
    } else {
        alert("Please select a file before submitting");
      
    }
  };

  async function isAuthorCall(){
    const accounts = await web3.eth.getAccounts();
    const isAuthorBool = await story.methods.isAuthor().call({
        from: accounts[0]
    });
    setIsAuthor(isAuthorBool);
  }

  async function fetchStoryInfo() {
    try {
        const found = await story.methods.getSummary().call();
        fetchAllChapters(found[3]);
    } catch (error) {
        console.error('Error fetching story info:', error);
    }
  }

  const fetchAllChapters = async (foundChapters) => {
    try{
        const chaptersSummariesFetched = [];

        for (let i = 0; i < foundChapters.length; i++) {
            const chapter = Chapter(foundChapters[i]);
            let chapterSummaryFetched = await chapter.methods.getSummary().call();
            chapterSummaryFetched = { address: foundChapters[i], ...chapterSummaryFetched };
            //console.log(chapterSummaryFetched);
            chaptersSummariesFetched.push(chapterSummaryFetched);
        }

        setAllChapters(chaptersSummariesFetched);


    }catch (error) {
        console.error('Error fetching chapter info:', error);
    }
    
  };

  const handleNodeSelect = (selectedNodeId) => {
    };


  useEffect(()=>{
    setIsClient(true);
    fetchStoryInfo();
  }, [])

  return (
    <Layout>
        <Card style={{ height: '80vh', width: '100%', maxWidth: '100vw', marginBottom: '10px' }}>
          <Card.Header style={{textAlign: 'right'}}>
          </Card.Header>
          <Card.Body style={{maxHeight:'100%',overflow:'auto', textAlign: 'center'  }} >
            {isClient && <RenderGraph allChapters={allChapters} onNodeSelect={handleNodeSelect} suppressHydrationWarning={true}/>  }
          </Card.Body>
          <Card.Footer style={{ overflowWrap: 'break-word', wordWrap: 'break-word', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="parentChapterDropdown">
              {parentChapterLabel === "" ?  "Select Parent Chapter" : parentChapterLabel }
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {allChapters.map((chapter) => (
                <Dropdown.Item key={chapter.address} onClick={() => {setParentChapter(chapter.address);setParentChapterLabel(chapter[2]);}}>
                 {chapter[2]}
                </Dropdown.Item>
              ))}
              <Dropdown.Item onClick={() => {setParentChapter("0x0000000000000000000000000000000000000000");setParentChapterLabel("No Parent Chapter");}}>
                {"No Parent Chapter"}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
            <Form.Group style={{ flex: 1, margin: '0 10px' }}>
              <Form.Control 
                type="text" 
                placeholder="Enter the chapter title" 
                value={chapterTitle} 
                onChange={(e) => setChapterTitle(e.target.value)} 
              />
            </Form.Group>
            <input
              type="file"
              id="file"
              ref={inputFile}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              variant='primary'
              disabled={uploading}
              onClick={() => inputFile.current.click()}
              style={{marginRight: '10px'}}
            >
              Select File
            </Button>
            <Dropdown style={{marginRight: '10px'}}>
            <Dropdown.Toggle variant="secondary" id="childChapterDropdown">
            {childChapterLabel === "" ?  "Select Child Chapter" : childChapterLabel }
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {allChapters.map((chapter) => (
                <Dropdown.Item key={chapter.address} onClick={() => {setChildChapter(chapter.address); setChildChapterLabel(chapter[2]);}}>
                  {chapter[2]}
                </Dropdown.Item>
              ))}
              <Dropdown.Item onClick={() => {setChildChapter("0x0000000000000000000000000000000000000000");setChildChapterLabel("No Child Chapter");}}>
                {"No Child Chapter"}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
            <Button
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
          </Card.Footer>

      </Card>
      
    </Layout>
  );
};
 
export default NewChapter;

export async function getServerSideProps(context) {
  return {
      props: {
          storyAddress: context.query.address
      }
  };
}