import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Table, Button, Spinner } from 'react-bootstrap';

const ViewRequestsToJoin = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [requestsToJoin, setRequestsToJoin] = useState([]);
    const [authorsCount, setAuthorsCount] = useState(0);
    const [voteLoading , setVoteLoading] = useState(false);

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            const requestsToJoinCount = Number(found[6]);
            const authorsCountFetched = found[4].length;
            const requestsToJoinFetched = await Promise.all(
                Array(requestsToJoinCount)
                    .fill()
                    .map((element,index) => {
                        return story.methods.requestsToJoin(index).call();
                    })) // Fetch requests one by one using the index
            setRequestsToJoin(requestsToJoinFetched);
            setAuthorsCount(authorsCountFetched);
    
        } catch (error) {
            console.error('Error fetching story info:', error);
        }
    }

    function interpretTimestamp(foundTimestamp){
        // Convert the Unix timestamp to milliseconds (Unix timestamps are in seconds)
        const milliseconds = Number(foundTimestamp) * 1000;
        // Create a new Date object with the converted milliseconds
        const date = new Date(milliseconds);
        // Use the Date object's methods to get the desired date and time components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month index starts from 0, so add 1
        const day = date.getDate();
        // Construct the formatted date string in "dd/mm/yy" format
        const formattedDate = `${day}/${month}/${year.toString().slice(-2)}`;
        return formattedDate;
    }

    const handleRowClick = async (index) => {
        setVoteLoading(true);
        const story = Story(address);
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

            window.location.href = 'http://localhost:3000';


        } catch (error) {
            console.error(error);
        }
        setVoteLoading(false);
    };

    useEffect(() => {
        viewRequests();
    }, []);

    return(
        <Layout>
            <br></br>
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>Proposal</th>
                        <th>Timestamp</th>
                        <th>Address of author</th>
                        <th>Aprrovers Count</th>
                        <th>Status</th>
                        <th>Vote</th>
                    </tr>
                </thead>
                <tbody>
                {requestsToJoin.map((request, index) => (
                    <tr key={index}>
                        <td>{request[0]}</td>
                        <td>{interpretTimestamp(Number(request[1]))}</td>
                        <td>{request[2]}</td>
                        <td>{request[4].toString() === "true" ? "All have Voted" : Number(request[3]) +"/"+ authorsCount}</td>
                        <td>{request[4].toString() === "true" ? "accepted" : "not accepted"}</td>
                        <td>{request[4].toString() === "false" ?
                            <Button disabled={voteLoading} onClick={() => handleRowClick(index)}>
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
