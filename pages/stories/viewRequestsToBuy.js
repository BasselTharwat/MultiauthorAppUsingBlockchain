import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import factory from '../../ethereum/factory.js';
import web3 from '../../ethereum/web3.js';
import { useRouter } from 'next/router';
import { Table, Button, Spinner, Modal, Form } from 'react-bootstrap';

const ViewRequestsToBuy = ({storyAddress}) => {
    const story = Story(storyAddress);

    const [requestsToBuy, setRequestsToBuy] = useState([]);
    const [authorsCount, setAuthorsCount] = useState(0);
    const [voteLoading , setVoteLoading] = useState(false);
    const [usernames, setUsernames] = useState({});
    const [isAuthor, setIsAuthor] = useState(false);
    const [showCreateRequestToBuy, setShowCreateRequestToBuy] = useState(false);
    const [biddingAmount, setBiddingAmount] = useState(0);
    const [loadingCreateRequestToBuy, setLoadingCreateRequestToBuy] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [requestUsername, setRequestUsername] = useState("");

    const handleCloseCreateRequestToBuy = () => setShowCreateRequestToBuy(false);
    const handleShowCreateRequestToBuy = () => setShowCreateRequestToBuy(true);
    
    const handleUsernameChange = (event) => {
        setRequestUsername(event.target.value);
    }



    const handleCreateRequestToBuy = async (event) => {
        event.preventDefault();
        setLoadingCreateRequestToBuy(true);
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

                const gasEstimate = await story.methods.createRequestToBuy().estimateGas({
                    from: accounts[0],
                    value: web3.utils.toWei(biddingAmount, 'ether')
                });
                const encode = await story.methods.createRequestToBuy().encodeABI();
        
                await story.methods.createRequestToBuy().send({
                    from: accounts[0],
                    value: web3.utils.toWei(biddingAmount, 'ether'),
                    gas: gasEstimate.toString(),
                    data: encode
                });

                
                setBiddingAmount(0);
                setRequestUsername("");
                setShowUsernamePrompt(false);
            }
            else{
                const accounts = await web3.eth.getAccounts();
                const fetchedUsername = await factory.methods.authorUsernames(accounts[0]).call()
                if(fetchedUsername === ""){
                    setShowUsernamePrompt(true);
                    setLoadingCreateRequestToBuy(false);
                    return;
                }
                else{
                    const gasEstimate = await story.methods.createRequestToBuy().estimateGas({
                        from: accounts[0],
                        value: web3.utils.toWei(biddingAmount, 'ether')
                    });
                    const encode = await story.methods.createRequestToBuy().encodeABI();
            
                    await story.methods.createRequestToBuy().send({
                        from: accounts[0],
                        value: web3.utils.toWei(biddingAmount, 'ether'),
                        gas: gasEstimate.toString(),
                        data: encode
                    });

                    setBiddingAmount(0);
                }
            }
    
        } catch (error) {
            console.error('Error creating request:', error);
        }
        setLoadingCreateRequestToBuy(false);
    };

    async function isAuthorCall(authors){
        const accounts = await web3.eth.getAccounts();
        setIsAuthor(authors.includes(accounts[0]));
    }

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            isAuthorCall(found[3]);
            const requestsToBuyCount = Number(found[9]);
            const authorsCountFetched = found[3].length;
            const requestsToBuyFetched = await Promise.all(
                Array(requestsToBuyCount)
                    .fill()
                    .map((element,index) => {
                        return story.methods.requestsToBuy(index).call();
                    })) // Fetch requests one by one using the index
            setRequestsToBuy(requestsToBuyFetched);
            setAuthorsCount(authorsCountFetched);
    
        } catch (error) {
            console.error('Error fetching story info:', error);
        }
    }

    async function fetchUsernames() {
        const newUsernameState = {};
        await Promise.all(
            requestsToBuy.map(async (request, index) => {
                const username = await factory.methods.authorUsernames(request[1]).call();
                newUsernameState[index] = username;
            })
        );
        setUsernames(newUsernameState);
    }

    useEffect(() => {
        viewRequests();
    }, []);

    useEffect(() => {
        fetchUsernames();
    }, [requestsToBuy]);

    const handleVoteClick = async (index) => {
        setVoteLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.approveRequestToBuy(index).estimateGas({
                from: accounts[0]
            });
            const encode = await story.methods.approveRequestToBuy(index).encodeABI();

            await story.methods.approveRequestToBuy(index).send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });


        } catch (error) {
            console.error(error);
        }
        setVoteLoading(false);
        viewRequests();
    };

    return(
        <Layout>
            <br></br>
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Bidder</th>
                        <th>Aprrovers Count</th>
                        <th>Status</th>
                        {isAuthor && (
                            <th>Vote</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                {requestsToBuy.map((request, index) => (
                    <tr key={index}>
                        <td>{web3.utils.FromWei(Number(request[0]),'ether')}</td>
                        <td>{usernames[index]}</td>
                        <td>{request[4].toString() === "true" ? "All have Voted" : Number(request[3]) +"/"+ authorsCount}</td>
                        <td>{request[4].toString() === "true" ? "accepted" : "not accepted"}</td>
                        {isAuthor && (
                            <td>{request[4].toString() === "false" ?
                            <Button disabled={voteLoading} onClick={() => handleVoteClick(index)}>
                                {voteLoading ?
                                    <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    /> :
                                    "Vote"
                            }</Button> : ""}
                        </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </Table> 

            <div style={{ position: "fixed", bottom: "30px", right: "50px" }}>
                <Button variant="primary" style={{ width: "200px", height: "50px" }} onClick={handleShowCreateRequestToBuy}>Request to own story</Button>
            </div>  
            <>
            <Modal show={showCreateRequestToBuy} onHide={handleCloseCreateRequestToBuy}>
                    <Modal.Header closeButton>
                        <Modal.Title>Request to own the story!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control 
                            type="number" 
                            value={biddingAmount}
                            onChange={(e) => setBiddingAmount(e.target.value)} 
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
                        <Button variant="primary" onClick={handleCreateRequestToBuy}>
                            {loadingCreateRequestToBuy && <Spinner
                                as="span"
                                animation="border"  
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                            {!loadingCreateRequestToBuy && "Place your bid" }
                        </Button>
                    </Modal.Footer>
                </Modal>
            </> 
        </Layout>
    )

};

export default ViewRequestsToBuy;

export async function getServerSideProps(context) {
    return {
        props: {
            storyAddress: context.query.address
        }
    };
}
