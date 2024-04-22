import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Table } from 'react-bootstrap';


const ViewRequests = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [requests, setRequests] = useState([]);

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            setRequests(found[1]);
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
    
        } catch (error) {
            console.error(error);
        }
    
    };

    useEffect(() => {
        viewRequests();
    }, []);

    return(
        <Layout>
            <h6>Click on a row to accept request</h6>
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>Proposal</th>
                        <th>Timestamp</th>
                        <th>Address of author</th>
                    </tr>
                </thead>
                <tbody>
                {requests.map((request, index) => (
                    <tr key={index} onClick={() => handleRowClick(index)} style={{cursor: 'pointer'}}>
                        <td>{request[0]}</td>
                        <td>{interpretTimestamp(Number(request[1]))}</td>
                        <td>{request[2]}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>    
        </Layout>
    )

};
export default ViewRequests;