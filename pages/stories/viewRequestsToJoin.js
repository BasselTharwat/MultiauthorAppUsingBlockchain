import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout.js';
import Story from '../../ethereum/story.js';
import factory from '../../ethereum/factory.js';
import web3 from '../../ethereum/web3.js';
import { useRouter } from 'next/router';
import { Table, Button, Spinner } from 'react-bootstrap';

const ViewRequestsToJoin = ({storyAddress}) => {
    const story = Story(storyAddress);

    const [requestsToJoin, setRequestsToJoin] = useState([]);
    const [authorsCount, setAuthorsCount] = useState(0);
    const [voteLoading , setVoteLoading] = useState(false);
    const [usernames, setUsernames] = useState({});

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            const requestsToJoinCount = Number(found[4]);
            const authorsCountFetched = found[2].length;
            const requestsToJoinFetched = await Promise.all(
                Array(requestsToJoinCount)
                    .fill()
                    .map((element,index) => {
                        return story.methods.requestsToJoin(index).call();
                    })) // Fetch requests one by one using the index
            setRequestsToJoin(requestsToJoinFetched);
            console.log(requestsToJoinFetched);
            setAuthorsCount(authorsCountFetched);
    
        } catch (error) {
            console.error('Error fetching story info:', error);
        }
    }

    async function fetchUsernames() {
        const newUsernameState = {};
        await Promise.all(
            requestsToJoin.map(async (request, index) => {
                console.log(request);
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
    }, [requestsToJoin]);

    const handleVoteClick = async (index) => {
        setVoteLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.approveRequestToJoin(index).estimateGas({
                from: accounts[0]
            });
            const encode = await story.methods.approveRequestToJoin(index).encodeABI();

            await story.methods.approveRequestToJoin(index).send({
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
                        <th>Proposal</th>
                        <th>Author</th>
                        <th>Aprrovers Count</th>
                        <th>Status</th>
                        <th>Vote</th>
                    </tr>
                </thead>
                <tbody>
                {requestsToJoin.map((request, index) => (
                    <tr key={index}>
                        <td>{request[0]}</td>
                        <td>{usernames[index]}</td>
                        <td>{request[3].toString() === "true" ? "All have Voted" : Number(request[2]) +"/"+ authorsCount}</td>
                        <td>{request[3].toString() === "true" ? "accepted" : "not accepted"}</td>
                        <td>{request[3].toString() === "false" ?
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
                    </tr>
                ))}
                </tbody>
            </Table>    
        </Layout>
    )

};

export default ViewRequestsToJoin;

export async function getServerSideProps(context) {
    return {
        props: {
            storyAddress: context.query.address
        }
    };
}
