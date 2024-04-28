import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from '../../routes.js';
import Files from '../../components/Files';

const ViewStory = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);


    const [show, setShow] = useState(false);
    const [storySummary, setStorySummary] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [counter, setCounter] = useState(0);
    

    async function fetchStoryInfo() {
        try {
            const found = await story.methods.getSummary().call();
            console.log(found);

            /*
            setStorySummary({
                authorsForReact: found[0],
                requestsToJoin: found[1], 
                usernameAndPassword: found[2],
                pem: found[3]
            });
            */

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

    /*
    const incrementCounter = () => {
        if (counter < storyJSON.chapters.length - 1) {
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
            setCounter(storyJSON.chapters.length - 1);
        }
        fetchChapter(counter);
    };
    */

    /*
    const handleLike = async (event) => {
        
        event.preventDefault();
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
                
                const controller = new AbortController()
                // many minutes timeout:
                const timeoutId = setTimeout(() => controller.abort(), 5000000)

                //update the json on the ipfs
                await fetch("../../api/createOrUpdateStoryIPFS",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({usernameAndPassword: storySummary.usernameAndPassword,
                        pem: storySummary.pem,
                        storyJSON: storyJSON,
                        signal: controller.signal})
                    });
            }
            
            


        }catch(error) {
            console.error('Error liking the story:', error);
        }
        

    } 
    */   

    /*
    const handleReport = async (event) => {
        event.preventDefault();
        setLoadingReport(true);
        try{
            //get the account address that wants to like the story
            const fetchedAccount = (await web3.eth.getAccounts())[0];
            
            //convert the array of likers' accounts to a set to speed up the search process
            const reportersSet = new Set(storyJSON.reports);
            
            //we want to make sure the same user can't like the story more than once
            if (reportersSet.has(fetchedAccount)) {
                console.log("Account reported the story before.");
            } else {
                
            //update the json
            let updatedStoryJSON = storyJSON.reports.push(fetchedAccount);
            

            if(storyJSON.reports.length > 2){ //arbitrary number
                storyJSON.reported = true;
                updatedStoryJSON = storyJSON;
            } 

            setStoryJSON(updatedStoryJSON);
            

            const controller = new AbortController()
            // many minutes timeout:
            const timeoutId = setTimeout(() => controller.abort(), 5000000)
            //update the json on the ipfs
            await fetch("../../api/createOrUpdateStoryIPFS",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({usernameAndPassword: storySummary.usernameAndPassword,
                    pem: storySummary.pem,
                    storyJSON: storyJSON}),
                signal: controller.signal
                });
            }


        }catch(error) {
            console.error('Error reporting the story:', error);
        }

        setLoadingReport(false);

    }    
    */


    /*
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
    */




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
                    {/**
                    {counter && storyJSON.chapters[counter] &&
                        (<Card.Text>{"Created at "+ interpretTimestamp(storyJSON.chapters[counter].timestamp)}</Card.Text>)}
                    */}    
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

