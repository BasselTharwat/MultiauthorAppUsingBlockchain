import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from '../../routes.js'


const ViewStory = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [show, setShow] = useState(false);
    const [storySummary, setStorySummary] = useState({
        mainIdea: "",
        storyStrings: [],
        authorsForReact: [],
        requestsToJoin: []
    });

    const [counter, setCounter] = useState(0);
    const [requestProposal, setRequestProposal] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAuthor, setIsAuthor] = useState(false);

    async function viewStoryInfo() {
        try {
            const found = await story.methods.getSummary().call();
            console.log(found);

            setStorySummary({
                mainIdea: found[0],
                storyStrings: found[1],
                authorsForReact: found[2], 
                requestsToJoin: found[3]
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
            console.error('Error fetching story info:', error);
        }
        setLoading(false);
    };
    
    useEffect(() => {
        isAuthorCall();
        viewStoryInfo();

    }, []);

    const incrementCounter = () => {
        if (counter < storySummary.storyStrings.length - 1) {
            setCounter(prevCounter => prevCounter + 1);
        } else {
            setCounter(0);
        }
    };

    const decrementCounter = () => {
        if (counter > 0) {
            setCounter(prevCounter => prevCounter - 1);
        } else {
            setCounter(storySummary.storyStrings.length - 1);
        }
    };

    const handleProposalChange = (event) => {
        setRequestProposal(event.target.value);
    };

    return(
        <Layout  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: '35rem', marginBottom: '10px' ,  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card.Body>
                    <Card.Title>Title</Card.Title>
                    <Card.Text>
                        {storySummary.storyStrings[counter]}
                    </Card.Text>
                    <Card.Footer style={{marginBottom: '10px'}}>
                        {"Meet the authors : " + storySummary.authorsForReact}
                    </Card.Footer>
                    <Button variant="primary" onClick={incrementCounter}>Next Chapter</Button>
                    <Button variant="primary" onClick={decrementCounter}>Previous Chapter</Button>
                </Card.Body>
            </Card>
            <>
                <Button variant="secondary" onClick={handleShow}>
                    Create a request to join
                </Button>
                <Link route={`/stories/${address}/viewRequests`}>
                    <Button variant='secondary' disabled={!isAuthor}>
                    {"View Requests (Only for authors)"}
                    </Button>
                </Link>

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
                            Cancel
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
