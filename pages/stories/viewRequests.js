import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';


const ViewRequests = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [requests, setRequests] = useState([{
        proposal: "",
        timestamp: 0,
        address: ""
    }]);

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            console.log(found);
            setRequests(found[3]);

            
          
        } catch (error) {

            console.error('Error fetching story info:', error);
        }
    }

    useEffect(() => {
        console.log("hi");
        viewRequests();
    }, []);

    return(
        <Layout>
            <h1>hi</h1>
        </Layout>
    )

};
export default ViewRequests;