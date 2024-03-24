import React, { useState } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import { useRouter } from 'next/router';
import { Form, Button, Spinner } from 'react-bootstrap';
import web3 from '../../ethereum/web3';

const NewChapter = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [chapterString, setChapterString] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setChapterString(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await story.methods.addChapter(chapterString).estimateGas({
                from: accounts[0]
            });
    
            const encode = await story.methods.addChapter(chapterString).encodeABI();
    
            await story.methods.addChapter(chapterString).send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

            setChapterString("");
    
        } catch (error) {
            console.error('Error fetching story info:', error);
        }
        setLoading(false);
    };
    

    return (
        <Layout>
            <h5>Welcome, author! Add a New Chapter</h5>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="chapterText">
                    <Form.Control style={{marginBottom: "10px"}}
                        as="textarea"
                        rows={10}
                        value={chapterString}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" >
                    {loading && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                    {!loading && "Add Chapter" }
                </Button>
            </Form>
        </Layout>
    );
};

export default NewChapter;

/*
import React, { useState } from 'react';
import Layout from '../../components/layout';
import Story from '../../ethereum/story';
import { useRouter } from 'next/router';
import { Form, Button, Spinner } from 'react-bootstrap';
import web3 from '../../ethereum/web3';
import { createHelia } from 'helia';
import { json } from '@helia/json';

const NewChapter = () => {
    const router = useRouter();
    const { asPath } = router;
    const segments = asPath.split('/'); 
    segments.pop(); 
    const address = segments.pop();
    const story = Story(address);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileData = reader.result.replace(/^data:.*?;base64,/, '');
                const fileType = file.type.split('/')[0];
                const helia = await createHelia();
                const j = json(helia);
                const fileJSON = { [fileType]: fileData };
                const ipfsCid = await j.add(fileJSON);
                const accounts = await web3.eth.getAccounts();
                const gasEstimate = await story.methods.addChapter(ipfsCid).estimateGas({
                    from: accounts[0]
                });
        
                const encode = await story.methods.addChapter(ipfsCid).encodeABI();
        
                await story.methods.addChapter(ipfsCid).send({
                    from: accounts[0],
                    gas: gasEstimate.toString(),
                    data: encode
                });
        
                setFile(null);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading file to IPFS:', error);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <h5>Welcome, author! Add a New Chapter</h5>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="file">
                    <Form.File
                        label="Upload File"
                        onChange={handleFileChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!file || loading}>
                    {loading && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />}
                    {!loading && "Upload File" }
                </Button>
            </Form>
        </Layout>
    );
};

export default NewChapter;
*/

