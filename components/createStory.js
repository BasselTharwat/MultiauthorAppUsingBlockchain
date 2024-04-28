import React, { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import factory from '../ethereum/factory.js';

const CreateStory = () => {
    const [mainIdea, setMainIdea] = useState("");
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChangeMainIdea = (event) => {
        setMainIdea(event.target.value);
    };

    const handleInputChangeTitle = (event) => {
        setTitle(event.target.value);
    };

    const handleInputChangeGenre = (event) => {
        setGenre(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const accounts = await web3.eth.getAccounts();

            // Create a story on the blockchain
            await factory.methods.createStory(title, genre, mainIdea).send({
                from: accounts[0]
            });

            setMainIdea("");
            setTitle("");
            setGenre("");

            // Redirect to localhost:3000 after story creation
            window.location.href = 'http://localhost:3000';
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Create a New Story!</h2>
            <Form onSubmit={handleSubmit} error={!!error}>
                <Form.Field>
                    <label>Write the main idea</label>
                    <Input
                        value={mainIdea}
                        onChange={handleInputChangeMainIdea}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Give your story a title</label>
                    <Input
                        value={title}
                        onChange={handleInputChangeTitle}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Identify the genre</label>
                    <Input
                        value={genre}
                        onChange={handleInputChangeGenre}
                    />
                </Form.Field>
                <Message error header="Oops!" content={error} />
                <Button loading={loading} primary type="submit">Create!</Button>
            </Form>
        </div>
    );
};

export default CreateStory;
