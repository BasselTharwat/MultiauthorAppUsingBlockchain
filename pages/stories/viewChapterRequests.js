import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import Chapter from '../../ethereum/chapter'
import web3 from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { Table, Button, Spinner } from 'react-bootstrap';
import Files from '../../components/Files';

const ViewChapterRequests = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [chapterRequests, setChapterRequests] = useState([]);
    const [authorsCount, setAuthorsCount] = useState(0);
    const [voteLoading , setVoteLoading] = useState(false);
    const [parentChapterHashes, setParentChapterHashes] = useState({});
    const [childChapterHashes, setChildChapterHashes] = useState({});

    async function viewRequests() {
        try {
            const found = await story.methods.getSummary().call();
            const chapterRequestsCount = Number(found[7]);
            const authorsCountFetched = found[4].length;
            const chapterRequestsFetched = await Promise.all(
                Array(chapterRequestsCount)
                    .fill()
                    .map((element,index) => {
                        return story.methods.chapterRequests(index).call();
                    })) // Fetch requests one by one using the index

            setChapterRequests(chapterRequestsFetched);
            setAuthorsCount(authorsCountFetched);
    
        } catch (error) {
            console.error('Error fetching story info:', error);
        }
    }

    const fetchContentHash = async (address) => {
        try{
            const chapter = Chapter(address);
            const hash = await chapter.methods.ipfsHash().call();    
            return hash;
        }catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        async function fetchChapterHashes() {
            const parentHashes = {};
            const childHashes = {};

            await Promise.all(chapterRequests.map(async (request) => {
                if (request[3] !== "0x0000000000000000000000000000000000000000") {
                    const parentHash = await fetchContentHash(request[3]);
                    parentHashes[request[3]] = parentHash;
                }

                if (request[4] !== "0x0000000000000000000000000000000000000000") {
                    const childHash = await fetchContentHash(request[4]);
                    childHashes[request[4]] = childHash;
                }
            }));

            setParentChapterHashes(parentHashes);
            setChildChapterHashes(childHashes);
        }

        fetchChapterHashes();
    }, [chapterRequests]);

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

    const handleVoteClick = async (index) => {
        setVoteLoading(true);
        const story = Story(address);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.approveChapterRequest(index).estimateGas({
                from: accounts[0]
            });
            const encode = await story.methods.approveChapterRequest(index).encodeABI();

            await story.methods.approveChapterRequest(index).send({
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
            <div style={{ overflowX: 'auto' }}>
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>IPFS Hash</th>
                        <th>Timestamp</th>
                        <th>Address of author</th>
                        <th>Parent Chapter</th>
                        <th>Child Chapter</th>
                        <th>Aprrovers Count</th>
                        <th>Status</th>
                        <th>Vote</th>
                    </tr>
                </thead>
                <tbody>
                {chapterRequests.map((request, index) => (
                    <tr key={index}>
                        <td><Files chapterCid={request[0]}/></td>
                        <td>{interpretTimestamp(Number(request[1]))}</td>
                        <td>{request[2]}</td>
                        <td>{parentChapterHashes[request[3]] && <Files chapterCid={parentChapterHashes[request[3]]}/>}</td>
                        <td>{childChapterHashes[request[4]] && <Files chapterCid={childChapterHashes[request[4]]}/>}</td>
                        <td>{request[6].toString() === "true" ? "All have Voted" : Number(request[5]) +"/"+ authorsCount}</td>
                        <td>{request[6].toString() === "true" ? "accepted" : "not accepted"}</td>
                        <td>{request[6].toString() === "false" ?
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
            </div>
        </Layout>
    )

};

export default ViewChapterRequests;
