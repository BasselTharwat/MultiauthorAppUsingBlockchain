import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import Chapter from '../../ethereum/chapter.js'
import web3 from '../../ethereum/web3.js';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { Link } from '../../routes.js';
import Files from '../../components/Files.jsx';
import 'bootstrap-icons/font/bootstrap-icons.css';
import factory from '../../ethereum/factory.js';


import RenderGraph from '../../components/renderGraph.js';


const ViewStory = ({storyAddress}) => {

    
    const story = Story(storyAddress);

    const [show, setShow] = useState(false);
    const [storySummary, setStorySummary] = useState({mainAuthor: "",
                                                    title: "",
                                                    genre: "",
                                                    mainIdea: "",
                                                    authors: [],
                                                    chapters: [],
                                                    requestsToJoin: 0,
                                                    reportersCount: 0,
                                                    reported: false,
                                                    balance: 0,
                                                    coverPhoto: ""});
    const [allChapters, setAllChapters] = useState([]);

    
    const [chapterSummary, setChapterSummary] = useState({story: "",
                                                    author: "",
                                                    title: "",
                                                    ipfsHash: "",
                                                    linkedParentChapters: [],
                                                    linkedChildChapters: [],
                                                    likeCount: 0});
    

    const [isAuthor, setIsAuthor] = useState(false);
    const [authorUsernames, setAuthorUsernames] = useState([]);
    
    const [currentChapter, setCurrentChapter] = useState("");
    const [sisterChapters, setSisterChapters] = useState([]);
    const [requestProposal, setRequestProposal] = useState("");
    const [loadingCreateRequest, setLoadingCreateRequest] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [requestUsername, setRequestUsername] = useState("");
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [contributionAmount, setContributionAmount] = useState(0);
    const [loadingContribute, setLoadingContribute] = useState(false);
    const [loadingDispense, setLoadingDispense] = useState(false);


    

    const handleProposalChange = (event) => {
        setRequestProposal(event.target.value);
    };

    const handleUsernameChange = (event) => {
        setRequestUsername(event.target.value);
    }

    const handleCreateRequest = async (event) => {
        event.preventDefault();
        setLoadingCreateRequest(true);
        try {
            if(showUsernamePrompt){
                const accounts = await web3.eth.getAccounts();
                
                const gasEstimateUsername = await factory.methods.addAuthorUsername(requestUsername).estimateGas({
                    from: accounts[0]
                });
        
                const encodeUsername = await factory.methods.addAuthorUsername(requestUsername).encodeABI();
        
                await factory.methods.addAuthorUsername(requestUsername).send({
                    from: accounts[0],
                    gas: gasEstimateUsername.toString(),
                    data: encodeUsername
                });

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
                setRequestUsername("");
                setShowUsernamePrompt(false);
            }
            else{
                const accounts = await web3.eth.getAccounts();
                const fetchedUsername = await factory.methods.authorUsernames(accounts[0]).call()
                if(fetchedUsername === ""){
                    setShowUsernamePrompt(true);
                    setLoadingCreateRequest(false);
                    return;
                }
                else{
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
                }
            }
    
        } catch (error) {
            console.error('Error creating request:', error);
        }
        setLoadingCreateRequest(false);
    };


    async function fetchStoryInfo() {
        try {
            const found = await story.methods.getSummary().call();
            
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
                balance: Number(found[9]),
                coverPhoto: found[10]
            });

            if(found[5].length>0){
                setCurrentChapter(found[5][0]);
            }

            fetchChapter(found[5][0]);
            fetchAuthorNames(found[4]);
            fetchAllChapters(found[5]);
            

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
    


    const fetchAllChapters = async (foundChapters) => {
        try{
            const chaptersSummariesFetched = [];

            for (let i = 0; i < foundChapters.length; i++) {
                const chapter = Chapter(foundChapters[i]);
                let chapterSummaryFetched = await chapter.methods.getSummary().call();
                chapterSummaryFetched = { address: foundChapters[i], ...chapterSummaryFetched };
                chaptersSummariesFetched.push(chapterSummaryFetched);
            }

            console.log(chaptersSummariesFetched);
            setAllChapters(chaptersSummariesFetched);


        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        
    };
    
    const fetchChapter = async (address) => {
        try{
            if(address){
                const chapter = Chapter(address);
                const found = await chapter.methods.getSummary().call();
                

                setChapterSummary({
                    story: found[0],
                    author: found[1],
                    title: found[2],
                    ipfsHash: found[3],
                    linkedParentChapters: found[4],
                    linkedChildChapters: found[5],
                    likeCount: Number(found[6])
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
                newIndex = currentIndex === sisterChapters.length - 1 ? currentIndex : currentIndex + 1;
            } else if (direction === 0) { // Fetch previous sister chapter
                newIndex = currentIndex === 0 ? 0 : currentIndex - 1;
            } else {
                console.error('Invalid direction. Please provide 1 for next chapter or 0 for previous chapter.');
                return;
            }
            const newChapterAddress = sisterChapters[newIndex];
            fetchChapter(newChapterAddress);
        } catch (error) {
            console.error('Error fetching sister chapter info:', error);
        }
    };

    /*
    const checkDirections = (found) => {
        if(found[4].length === 0){
            setHasChildChapters(false);
        }
        else{
            setHasChildChapters(true);
        }
        if(found[3].length === 0){
            setHasParentChapters(false);
        }
        else{
            setHasParentChapters(true);
        }
        const currentIndex = sisterChapters.indexOf(currentChapter);
        console.log(currentIndex);
        if(currentIndex < sisterChapters.length && currentIndex > 0){
            setHasSisterChapters1(true);
            setHasSisterChapters2(true);
        }else{
            if(currentIndex === 0){
                setHasSisterChapters1(true);
                setHasSisterChapters2(false);
            }else{
                if(currentIndex === sisterChapters.length){
                    setHasSisterChapters1(false);
                    setHasSisterChapters2(true);
                }
                else{
                    setHasSisterChapters1(false);
                    setHasSisterChapters2(false);
                }
            }
        }


    }
    */

   
    
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

    const handleContribute = async (event) => {
        event.preventDefault();
        setLoadingContribute(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.contribute().estimateGas({
                from: accounts[0],
                value: web3.utils.toWei(contributionAmount, 'ether')
            });
            const encode = await story.methods.contribute().encodeABI();
    
            await story.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(contributionAmount, 'ether'),
                gas: gasEstimate.toString(),
                data: encode
            });

        }catch(error) {
            console.error('Error contributing to the story:', error);
        }
        setContributionAmount(0);
        setLoadingContribute(false);
    };

    const handleDispenseRewards = async (event) => {
        event.preventDefault();
        setLoadingDispense(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.dispenseRewards().estimateGas({
                from: accounts[0]
            });
            const encode = await story.methods.dispenseRewards().encodeABI();
    
            await story.methods.dispenseRewards().send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

        }catch(error) {
            console.error('Error dispensing the rewards:', error);
        }
        setLoadingDispense(false);
        
    };

    const fetchAuthorNames = async (authorAddresses) => {
        try {
            const usernames = [];
            for (let i = 0; i < authorAddresses.length; i++) {
                const username = await factory.methods.authorUsernames(authorAddresses[i]).call();
                usernames.push(username);
            }

            setAuthorUsernames(usernames);
        } catch (error) {
            console.error('Error fetching author names:', error);
        }
    };
       
  




    useEffect(() => {
        isAuthorCall();
        fetchStoryInfo();

    }, []);


    return(
        <Layout  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
            <Card style={{ height: '80vh', width: '100%', maxWidth: '100vw', marginBottom: '10px', textAlign: 'center' }}>
                <Card.Body>
                    <Card.Title>{"Chapter: " + chapterSummary.title} <br/> {chapterSummary.author} <br/> {chapterSummary.likeCount>0 ? chapterSummary.likeCount+" likes" : ""}</Card.Title>
                    <Card.Text style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                    {chapterSummary && chapterSummary.ipfsHash && ( 
                        <Files chapterCid={chapterSummary.ipfsHash} /> 
                    )} 
                    </Card.Text>  
                    
                </Card.Body>
                <Card.Footer style={{marginBottom: '10px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                    <br></br>
                    <Button variant="primary" onClick={fetchParentChapters} className="mr-2 mb-2">
                        <i className="bi bi-arrow-up"></i> 
                    </Button>
                    <br></br>
                    <Button variant="primary" onClick={() => fetchSisterChapter(1)} className="mr-2 mb-2" style={{marginRight: "10px"}}>
                        <i className="bi bi-arrow-left"></i> 
                    </Button>
                    <Button variant="primary" onClick={() => fetchSisterChapter(0)} className="mr-2 mb-2">
                        <i className="bi bi-arrow-right"></i> 
                    </Button>
                    <br></br>
                    <Button variant="primary" onClick={fetchChildChapters} className="mb-2">
                        <i className="bi bi-arrow-down"></i> 
                    </Button>
                    </Card.Footer>
            </Card>
            <>
                <Row className="mb-3">
                <Col xs="auto">
                    <Button variant='success' disabled={loadingLike} onClick={handleLike} style={{marginRight: "10px"}}>
                    {loadingLike ?
                            <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            /> :
                            "Like Chapter"
                        }
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={handleContribute}>
                    {loadingContribute ?
                            <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            /> :
                            "Contribute to Story"
                        }
                    </Button>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="contributionAmount">
                        <Form.Control
                            type="number"
                            placeholder="Enter amount in Ether"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                </Row>
                <br></br>
                <Button variant="primary" onClick={handleShow} style={{marginTop: "10px" , marginRight: "10px"}}>
                    Create a request to join
                </Button>
                <br></br>
                <Link route={`/stories/${storyAddress}/viewRequestsToJoin`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginTop: "10px", marginRight: "10px"}}>
                    {"View Requests To Join (Only for authors)"}
                    </Button>
                </Link>
                <Link route={`/stories/${storyAddress}/newChapter`}>
                    <Button variant='secondary' disabled={!isAuthor} style={{marginTop: "10px", marginRight: "10px"}}>
                    {"Create a New Chapter (Only for authors)"}
                    </Button>
                </Link>
                <Button variant="secondary" disabled={!isAuthor} onClick={handleDispenseRewards} style={{marginTop: "10px", marginRight: "10px"}}>
                {loadingDispense ?
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        /> :
                        "Dispense Rewards"
                    }
                </Button>
                <br></br>
                
                <Button variant='danger' disabled={loadingReport} onClick={handleReport} style={{marginTop: "10px", marginRight: "10px"}}>
                {loadingReport ?
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        /> :
                        "Report Story"
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
                    {showUsernamePrompt && <Form.Group controlId="username">
                        <Form.Label>You are not registered as an author</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter your username" 
                            value={requestUsername} 
                            onChange={handleUsernameChange}
                        />
                    </Form.Group>}
                    </Modal.Body>
                    <Modal.Footer>
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
            <RenderGraph allChapters={allChapters}/>         
        </Layout>
    );
};

export default ViewStory;

export async function getServerSideProps(context) {
    return {
        props: {
            storyAddress: context.query.address
        }
    };
}

