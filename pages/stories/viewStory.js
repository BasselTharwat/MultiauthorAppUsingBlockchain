import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from '../../routes.js';
import Files from '../../components/Files';
import { useGlobalState } from '../../context/storyJSONContext.js';

const ViewStory = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);


    const [show, setShow] = useState(false);
    const [storySummary, setStorySummary] = useState({
        authorsForReact: [],
        requestsToJoin: [],
        reported: false,
        usernameAndPassword: "",
        pem: ""
    });

    const { storyJSON, setStoryJSON } = useGlobalState();

    const [counter, setCounter] = useState(0);
    const [requestProposal, setRequestProposal] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);
    const [chapterCid, setChapterCid] = useState('');
    

    async function fetchStoryInfo() {
        try {
            const found = await story.methods.getSummary().call();

            setStorySummary({
                authorsForReact: found[0],
                requestsToJoin: found[1],
                reported: found[2], 
                usernameAndPassword: found[3],
                pem: found[4]
            });

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

    const handleCreateRequest = async (event) => {
        event.preventDefault();
        setLoading(true);
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
        setLoading(false);
    };
    

    const incrementCounter = () => {
        if (counter < storySummary.storyStrings.length - 1) {
            setCounter(prevCounter => prevCounter + 1);
        } else {
            setCounter(0);
        }
        fetchChapter(counter);
    };

    const decrementCounter = () => {
        if (counter > 0) {
            setCounter(prevCounter => prevCounter - 1);
        } else {
            setCounter(storySummary.storyStrings.length - 1);
        }
        fetchChapter(counter);
    };

    const handleProposalChange = (event) => {
        setRequestProposal(event.target.value);
    };

    const handleLike = async (event) => {
        event.preventDefault();
        setLoading(true);
        try{
            //get the account address that wants to like the story
            const fetchedAccount = (await web3.eth.getAccounts())[0];
            
            //convert the array of likers' accounts to a set to speed up the search process
            const likersSet = new Set(storyJSON.likes);
            
            //we want to make sure the same user can't like the story more than once
            if (likersSet.has(fetchedAccount)) {
                console.log("Account liked the story before.");
            } else {
                
                //update the json
                const updatedStoryJSON = storyJSON.likes.push(fetchedAccount);
                setStoryJSON(updatedStoryJSON);

                //update the json on the ipfs
                await fetch("../../api/createOrUpdateStoryIPFS",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({usernameAndPassword: storySummary.usernameAndPassword,
                        pem: storySummary.pem,
                        storyJSON: storyJSON})
                    });
            }


        }catch(error) {
            console.error('Error liking the story:', error);
        }

        setLoading(false);

    }    

    const fetchChapter = async (counter) => {
        let chapterCidFetched
        if(storyJSON.chapters.length > 0){
            if(counter){
                chapterCidFetched = storyJSON.chapters[counter].cid;
            }
            else{ 
                chapterCidFetched = storyJSON.chapters[0].cid;
            }
            if(chapterCidFetched){
                setChapterCid(chapterCidFetched);
            }
       }
    };




    useEffect(() => {
        isAuthorCall();
        fetchStoryInfo();
        fetchChapter(counter);

    }, []);


    return(
        <Layout  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: '50rem', marginBottom: '10px', textAlign: 'center' }}>
                <Card.Body>
                    <Card.Title>{"Chapter "+ (counter+1)}</Card.Title>
                    <Card.Text style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                    {chapterCid && ( 
                        <Files chapterCid={chapterCid} /> 
                    )} 
                    </Card.Text>
                    <Card.Footer style={{marginBottom: '10px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                        {"Meet the authors : " + storySummary.authorsForReact}
                    </Card.Footer>
                    <Button variant="primary" onClick={incrementCounter} style={{marginRight: "10px"}}>Next Chapter</Button>
                    <Button variant="primary" onClick={decrementCounter}>Previous Chapter</Button>
                </Card.Body>
            </Card>
            <>
                <Button variant="secondary" onClick={handleShow} style={{marginRight: "10px"}}>
                    Create a request to join
                </Button>
                <Link route={`/stories/${address}/viewRequests`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginRight: "10px"}}>
                    {"View Requests (Only for authors)"}
                    </Button>
                </Link>
                <Link route={`/stories/${address}/newChapter`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginRight: "10px"}}>
                    {"New Chapter (Only for authors)"}
                    </Button>
                </Link>
                <br></br>
                <Button variant='success' disabled={loading} onClick={handleLike} style={{marginTop: "10px", marginRight: "10px"}}>
                {loading ?
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
                            {loading && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loading && "Create Request" }
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>             
        </Layout>
    );
};

export default ViewStory;

