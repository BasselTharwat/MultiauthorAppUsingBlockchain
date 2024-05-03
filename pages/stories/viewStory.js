import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import Chapter from '../../ethereum/chapter.js'
import web3 from '../../ethereum/web3.js';
import { useRouter } from 'next/router';
import { Card, Button, Modal, Form, Spinner, Row, Col, Dropdown } from 'react-bootstrap';
import { Link } from '../../routes.js';
import Files from '../../components/Files.jsx';
import 'bootstrap-icons/font/bootstrap-icons.css';
import factory from '../../ethereum/factory.js';
import { HandThumbsUpFill, HandThumbsUp, ThreeDotsVertical  } from 'react-bootstrap-icons';




import RenderGraph from '../../components/renderGraph.js';


const ViewStory = ({storyAddress}) => {

    
    const story = Story(storyAddress);
    const router = useRouter();


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
    const [requestProposal, setRequestProposal] = useState("");
    const [loadingCreateRequest, setLoadingCreateRequest] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [requestUsername, setRequestUsername] = useState("");
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [contributionAmount, setContributionAmount] = useState(0);
    const [loadingContribute, setLoadingContribute] = useState(false);
    const [loadingDispense, setLoadingDispense] = useState(false);

    const [showCreateRequest, setShowCreateRequest] = useState(false);
    const [showContribute, setShowContribute] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showDispenseRewards, setShowDispenseRewards] = useState(false);

    const [toggleView, setToggleView] = useState("Tree View"); //Chapter View or Tree View


    

    const handleProposalChange = (event) => {
        setRequestProposal(event.target.value);
    };

    const handleUsernameChange = (event) => {
        setRequestUsername(event.target.value);
    }

    const handleToggleView = () => {
        if(toggleView === "Chapter View")
            setToggleView("Tree View");
        else
            setToggleView("Chapter View");
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

    const handleCloseCreateRequest = () => setShowCreateRequest(false);
    const handleShowCreateRequest = () => setShowCreateRequest(true); 

    const handleCloseContribute = () => setShowContribute(false);
    const handleShowContribute = () => setShowContribute(true); 

    const handleCloseReport = () => setShowReport(false);
    const handleShowReport = () => setShowReport(true);

    const handleCloseDispenseRewards = () => setShowDispenseRewards(false);
    const handleShowDispenseRewards = () => setShowDispenseRewards(true);
    


    const fetchAllChapters = async (foundChapters) => {
        try{
            const chaptersSummariesFetched = [];

            for (let i = 0; i < foundChapters.length; i++) {
                const chapter = Chapter(foundChapters[i]);
                let chapterSummaryFetched = await chapter.methods.getSummary().call();
                chapterSummaryFetched = { address: foundChapters[i], ...chapterSummaryFetched };
                chaptersSummariesFetched.push(chapterSummaryFetched);
            }

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

    const fetchNextChapter = async () => {
        try{
            if(chapterSummary.linkedChildChapters.length>0){
                let maxLikes = -1;
                let mostLikedChapter = "";
                for(let i =0; i<chapterSummary.linkedChildChapters.length ;i++){
                    let chapter = Chapter(chapterSummary.linkedChildChapters[i]);
                    let likeCount = Number(await chapter.methods.likeCount().call());
                    if(likeCount>maxLikes){
                        maxLikes = likeCount;
                        mostLikedChapter = chapterSummary.linkedChildChapters[i];
                    }
                }
                fetchChapter(mostLikedChapter);
            }
            

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        

    }

    const fetchPreviousChapter = async () => {
        try{
            if(chapterSummary.linkedParentChapters.length>0){
                let maxLikes = -1;
                let mostLikedChapter = "";
                for(let i =0; i<chapterSummary.linkedParentChapters.length ;i++){
                    let chapter = Chapter(chapterSummary.linkedParentChapters[i]);
                    let likeCount = Number(await chapter.methods.likeCount().call());
                    if(likeCount>maxLikes){
                        maxLikes = likeCount;
                        mostLikedChapter = chapterSummary.linkedParentChapters[i];
                    }
                }
                fetchChapter(mostLikedChapter);
            }
            

        }catch (error) {
            console.error('Error fetching chapter info:', error);
        }
        

    }
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
        
            <Card style={{ height: '80vh', width: '100%', maxWidth: '100vw', marginBottom: '10px' }}>
                <Card.Header style={{textAlign: 'right'}}>
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="secondary"
                            id="dropdown-basic"
                            as={ThreeDotsVertical} 
                            style={{ cursor: 'pointer' }} 
                        />
                        <Dropdown.Menu>
                            {isAuthor==true ?
                            <> 
                                <Dropdown.Item onClick={() => router.push(`/stories/${storyAddress}/viewRequestsToJoin`)}>
                                    View requests to join
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => router.push(`/stories/${storyAddress}/newChapter`)}>
                                    Add a new chapter
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleShowDispenseRewards}>
                                    Dispense Rewards!
                                </Dropdown.Item>
                            </>
                            :
                            <>
                                <Dropdown.Item onClick={handleShowCreateRequest}>
                                Create a request to join
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleShowContribute}>
                                Contribute
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleShowReport}>
                                Report Story
                                </Dropdown.Item>
                            </>

                            }
                            
 
                            
                            
                            
                        </Dropdown.Menu>
                    </Dropdown>




                </Card.Header>
                <Card.Body style={{maxHeight:'100%',overflow:'auto', textAlign: 'center'  }} >
                {toggleView==="Chapter View" ? 
                    <>
                    <Card.Title>{"Chapter: " + chapterSummary.title} <br/> {authorUsernames} <br/> {chapterSummary.likeCount>0 ? chapterSummary.likeCount+" likes" : ""}</Card.Title>
                    <Card.Text style={{height: '100%'}}>
                        {chapterSummary && chapterSummary.ipfsHash && ( 
                            <Files chapterCid={chapterSummary.ipfsHash} />)}
                    </Card.Text>
                    </>
                    :
                    <RenderGraph allChapters={allChapters}/>      
                }
                </Card.Body>
                <Card.Footer style={{ overflowWrap: 'break-word', wordWrap: 'break-word', textAlign: 'right' }}>
                {toggleView === "Chapter View" ? 
                    <>
                    <Button variant="primary"  onClick={() => fetchPreviousChapter()} className="mr-2 mb-2" style={{marginRight: "10px"}}>
                        <i className="bi bi-arrow-left"></i> 
                    </Button>
                    <Button variant="primary" onClick={() => fetchNextChapter()} className="mr-2 mb-2" style={{marginRight: "850px"}}>
                        <i className="bi bi-arrow-right"></i> 
                    </Button>
                    {loadingLike ?
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        /> :
                        <HandThumbsUp
                            size={30}
                            style={{marginRight: "10px", marginBottom: '5px'}}
                            color={loadingLike ? "gray" : "#007bff"}
                            disabled={loadingLike}
                            onClick={loadingLike ? null : handleLike}
                    />}
                    </>
                        :
                    <></>
                    }
                    <Button variant="secondary" onClick={() => handleToggleView()} className="mr-2 mb-2">
                        {toggleView === "Chapter View" ? "Tree View" : "Chapter View"}
                    </Button>
                </Card.Footer>
            </Card>
            <>


                
                <Modal show={showCreateRequest} onHide={handleCloseCreateRequest}>
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

                <Modal show={showContribute} onHide={handleCloseContribute}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter the contribution amount</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="contributionAmount">
                            <Form.Control
                                type="number"
                                placeholder="Enter amount in Ether"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleContribute}>
                            {loadingContribute && <Spinner
                                as="span"
                                animation="border"  
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loadingContribute && "Contribute" }
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showReport} onHide={handleCloseReport}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to report story?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>If reports increase alarmingly, the story gets shut down!</Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={handleReport}>
                            {loadingReport && <Spinner
                                as="span"
                                animation="border"  
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loadingReport && "Report" }
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDispenseRewards} onHide={handleCloseDispenseRewards}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to dispense rewards?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Total funds gained from user contributions are divided and distributed equally among this story's authors.
                        If there are no funds, you get no rewards!
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleDispenseRewards}>
                            {loadingDispense && <Spinner
                                as="span"
                                animation="border"  
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loadingDispense && "Dispense" }
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
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

