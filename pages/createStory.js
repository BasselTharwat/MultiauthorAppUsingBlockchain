
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import web3 from '../ethereum/web3.js';
import factory from '../ethereum/factory.js';
import Layout from '../components/layout.js';

const CreateStory = () => {
    const [mainIdea, setMainIdea] = useState("");
    const [title, setTitle] = useState("");
    const [coverPhotoFile, setCoverPhotoFile] = useState(null); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [loadingCreateUsername, setLoadingCreateUsername] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleInputChangeMainIdea = (event) => {
        setMainIdea(event.target.value);
    };

    const handleInputChangeTitle = (event) => {
        setTitle(event.target.value);
    };
    const handleUsernameInputChange = (event) => {
        setNewUsername(event.target.value);
    };

    const handleCreateUsername = async (event) => {
        event.preventDefault();
        setLoadingCreateUsername(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const gasEstimate = await factory.methods.addAuthorUsername(newUsername).estimateGas({
                from: accounts[0]
            });
    
            const encode = await factory.methods.addAuthorUsername(newUsername).encodeABI();
    
            await factory.methods.addAuthorUsername(newUsername).send({
                from: accounts[0],
                gas: gasEstimate.toString(),
                data: encode
            });

            setNewUsername("");

    
        } catch (error) {
            console.error('Error creating request:', error);
        }
        setLoadingCreateUsername(false);
    };

    const handleCoverPhotoChange = (event) => {
        setCoverPhotoFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const accounts = await web3.eth.getAccounts();
            const fetchedUsername = await factory.methods.authorUsernames(accounts[0]).call();
            if (fetchedUsername === "") {
                handleShow();
            } else {
                let coverPhotoIpfsHash = '';
                if (coverPhotoFile) {
                    const formData = new FormData();
                    formData.append('file', coverPhotoFile, { filename: coverPhotoFile.name });

                    const response = await fetch('/api/addToIPFS', {
                        method: 'POST',
                        body: formData,
                    });

                    coverPhotoIpfsHash = await response.text();
                }

                const gasEstimate = await factory.methods.createStory(title, mainIdea, coverPhotoIpfsHash).estimateGas({
                    from: accounts[0]
                });
        
                const encode = await factory.methods.createStory(title, mainIdea, coverPhotoIpfsHash).encodeABI();
        
                await factory.methods.createStory(title, mainIdea, coverPhotoIpfsHash).send({
                    from: accounts[0],
                    gas: gasEstimate.toString(),
                    data: encode
                });
    

                setMainIdea("");
                setTitle("");
                setCoverPhotoFile(null); // Clear cover photo file state
                // Redirect to localhost:3000 after story creation
                window.location.href = 'http://localhost:3000';
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        
        <Layout>
            <h2>Create a New Story!</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formTitle">
                    <Form.Label style={{ marginTop: "10px" }}>Give your story a title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={handleInputChangeTitle}
                    />
                </Form.Group>
                <Form.Group controlId="formMainIdea">
                    <Form.Label style={{ marginTop: "10px" }}>Write your main idea</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4} 
                        value={mainIdea}
                        onChange={handleInputChangeMainIdea}
                    />
                </Form.Group>
                <Form.Group controlId="formCoverPhoto">
                    <Form.Label style={{ marginTop: "10px" }}>Upload a cover photo</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoChange}
                    />
                </Form.Group>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button variant="primary" type="submit" style={{marginTop: "10px", width: "200px"}}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Publish!'}
                </Button>
            </Form>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ marginLeft: "10px", marginTop: "10px" }}>You are not registered as an author.</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formUsername">
                        <Form.Label>Create a Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={newUsername}
                            onChange={handleUsernameInputChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreateUsername} disabled={loadingCreateUsername}>
                        {loadingCreateUsername ? <Spinner animation="border" role="status" /> : 'Create Request'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Layout>
    );
};

export default CreateStory;
