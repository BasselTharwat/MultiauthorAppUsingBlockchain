import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import Chapter from '../../ethereum/chapter.js'
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from '../../routes.js';
import Files from '../../components/Files';
import chapter from '../../ethereum/chapter.js';

const ViewStory = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);


    const [show, setShow] = useState(false);
    const [storySummary, setStorySummary] = useState({mainAuthor: "",
                                                    title: "",
                                                    genre: "",
                                                    mainIdea: "",
                                                    authors: [],
                                                    chapters: [],
                                                    requestsToJoin: 0,
                                                    chapterRequests: 0,
                                                    reportersCount: 0,
                                                    reported: false,
                                                    balance: 0});

    const [chapterSummary, setChapterSummary] = useState({story: "",
                                                    author: "",
                                                    ipfsHash: "",
                                                    linkedParentChapters: [],
                                                    linkedChildChapters: [],
                                                    likeCount: 0});

    const [isAuthor, setIsAuthor] = useState(false);
    const [currentChapter, setCurrentChapter] = useState("");
    const [sisterChapters, setSisterChapters] = useState([]);
    const [requestProposal, setRequestProposal] = useState("");
    const [loadingCreateRequest, setLoadingCreateRequest] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);

    const handleProposalChange = (event) => {
        setRequestProposal(event.target.value);
    };

    const handleCreateRequest = async (event) => {
        event.preventDefault();
        setLoadingCreateRequest(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.createRequestToJoin(requestProposal).estimateGas({
                from: accounts[0]
            });
    
            const encode = await story.methods.createRequestToJoin(requestProposal).encodeABI();
    
            await story.methods.createRequestToJoin(requestProposal).send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

            setRequestProposal("");
    
        } catch (error) {
            console.error('Error creating request:', error);
        }
        setLoadingCreateRequest(false);
    };


    async function fetchStoryInfo() {
        try {
            const found = await story.methods.getSummary().call();
            console.log(found);

            
            setStorySummary({
                mainAuthor: found[0],
                title: found[1],
                genre: found[2],
                mainIdea: found[3],
                authors: found[4],
                chapters: found[5],
                requestsToJoin: Number(found[6]),
                reportersCount: Number(found[7]),
                reported: found[8],
                balance: Number(found[9])
            });

            if(found[5].length>0){
                setCurrentChapter(found[5][0]);
            }
            

        } catch (error) {
            console.error('Error fetching story info:', error);
        }
    }

    async function isAuthorCall(){
        const accounts = await web3.eth.getAccounts();
        const isAuthorBool = await story.methods.isAuthor().call({
            from: accounts[0]
        });
        setIsAuthor(isAuthorBool);
    }

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    
    
    const fetchChapter = async (address) => {
        try{
            if(address){
                const chapter = Chapter(address);
                const found = await chapter.methods.getSummary().call();
                console.log(found);

                setChapterSummary({
                    story: found[0],
                    author: found[1],
                    ipfsHash: found[2],
                    linkedParentChapters: found[3],
                    linkedChildChapters: found[4],
                    likeCount: Number(found[5])
                });

                setCurrentChapter(address);

            }

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        
    };

    const fetchChildChapters = async () => {
        try{
            
            setSisterChapters(chapterSummary.linkedChildChapters);
            const chapterAddress = chapterSummary.linkedChildChapters[0];
            fetchChapter(chapterAddress);

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        

    }

    const fetchParentChapters = async () => {
        try{
            
            setSisterChapters(chapterSummary.linkedParentChapters);
            const chapterAddress = chapterSummary.linkedParentChapters[0];
            fetchChapter(chapterAddress);

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        

    }

    const fetchSisterChapter = async (direction) => { //direction is a number. 1 represents next. 0 represents previous.
        try {
            let newIndex;
            const currentIndex = sisterChapters.indexOf(currentChapter);

            if (direction === 1) { // Fetch next sister chapter
                newIndex = currentIndex === sisterChapters.length - 1 ? 0 : currentIndex + 1;
            } else if (direction === 0) { // Fetch previous sister chapter
                newIndex = currentIndex === 0 ? sisterChapters.length - 1 : currentIndex - 1;
            } else {
                console.error('Invalid direction. Please provide 1 for next chapter or 0 for previous chapter.');
                return;
            }
            const newChapterAddress = sisterChapters[newIndex];
            await fetchChapter(newChapterAddress);
        } catch (error) {
            console.error('Error fetching sister chapter info:', error);
        }
    };

    
    const fetchFirstChapter = async () => {
        try{
            
            const chapterAddress = storySummary.chapters[0];
            fetchChapter(chapterAddress);

            //fetch sister chapters from the linked parent chapters of the child chapter
            //hanshoof 
            

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        

    }


    

    




    useEffect(() => {
        isAuthorCall();
        fetchStoryInfo();
        fetchFirstChapter();

    }, []);


    
    const handleLike = async (event) => {
        event.preventDefault();
        setLoadingLike(true);
        try {
            const chapter = Chapter(currentChapter);
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await chapter.methods.like().estimateGas({
                from: accounts[0]
            });
            const encode = await chapter.methods.like().encodeABI();
    
            await chapter.methods.like().send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

        }catch(error) {
            console.error('Error liking the chapter:', error);
        }

        setLoadingLike(false);
        

    } 

    const handleReport = async (event) => {
        event.preventDefault();
        setLoadingReport(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.report().estimateGas({
                from: accounts[0]
            });
            const encode = await story.methods.report().encodeABI();
    
            await story.methods.report().send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

        }catch(error) {
            console.error('Error reporting the story:', error);
        }
        setLoadingReport(false);
        

    } 
       
    return(
        <Layout  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
            <Card style={{ width: '50rem', marginBottom: '10px', textAlign: 'center' }}>
                <Card.Body>
                    <Card.Title>{"Chapter hanshoof kam"}</Card.Title>
                    <Card.Text style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                    {chapterSummary && chapterSummary.ipfsHash && ( 
                        <Files chapterCid={chapterSummary.ipfsHash} /> 
                    )} 
                    </Card.Text>  
                    <Card.Footer style={{marginBottom: '10px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                        {"Meet the authors : " + storySummary.authors}
                    </Card.Footer>
                    <Button variant="primary" onClick={() => fetchSisterChapter(1)} style={{marginRight: "10px"}}>Next Chapter</Button>
                    <Button variant="primary" onClick={() => fetchSisterChapter(0)}>Previous Chapter</Button>
                </Card.Body>
            </Card>
            <>
                <Button variant="secondary" onClick={handleShow} style={{marginRight: "10px"}}>
                    Create a request to join
                </Button>
                <br></br>
                <Link route={`/stories/${address}/viewRequestsToJoin`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginTop: "10px", marginRight: "10px"}}>
                    {"View Requests To Join (Only for authors)"}
                    </Button>
                </Link>
                <Link route={`/stories/${address}/newChapterRequest`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginTop: "10px", marginRight: "10px"}}>
                    {"New Chapter Request (Only for authors)"}
                    </Button>
                </Link>
                <Link route={`/stories/${address}/viewChapterRequests`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginTop: "10px", marginRight: "10px"}}>
                    {"View Chapter Requests (Only for authors)"}
                    </Button>
                </Link>
                <br></br>
                <Button variant='success' disabled={loadingLike} onClick={handleLike} style={{marginTop: "10px", marginRight: "10px"}}>
                {loadingLike ?
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        /> :
                        "Like"
                    }
                </Button>
                
                <Button variant='danger' disabled={loadingReport} onClick={handleReport} style={{marginTop: "10px", marginRight: "10px"}}>
                {loadingReport ?
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        /> :
                        "Report"
                    }
                </Button>
                


                
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Write your proposal here to join the authors</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={requestProposal}
                            onChange={handleProposalChange} 
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Text style={{flex:"1"}}>Total number of requests to join: {storySummary.requestsToJoin.length}</Form.Text>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleCreateRequest}>
                            {loadingCreateRequest && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loadingCreateRequest && "Create Request" }
                        </Button>
                    </Modal.Footer>
                </Modal>
                
            </>
                       
        </Layout>
    );
};

export default ViewStory;

