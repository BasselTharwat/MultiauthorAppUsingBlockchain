import React, { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import factory from '../ethereum/factory.js';
import web3 from '../ethereum/web3.js';
import story from '../ethereum/story.js';

const CreateStory = () =>{
    const[mainIdea, setMainIdea] = useState("");
    const[title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    
    const handleInputChangeMainIdea = (event) => {
        setMainIdea(event.target.value);
    };
    const handleInputChangeTitle = (event) => {
        setTitle(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try{
        //create a story on the blockchain
        const accounts = await web3.eth.getAccounts();
        const gasEstimate = await factory.methods.createStory().estimateGas({
            from: accounts[0]
          });
    
          const encode = await factory.methods.createStory().encodeABI();

         const transactionReceipt = await factory.methods.createStory().send({
            from: accounts[0],
            gas: gasEstimate.toString(),
            data: encode
          });
          //get the address of the story from the receipt
          let storyAddress = transactionReceipt.logs[0].topics[1].slice(2);
          //remove extra leading zeros
          storyAddress = '0x' + storyAddress.replace(/^0+/, '');
          
          //create a json for the story to be stored on the ipfs & ipns
          const storyJSON = {
            "storyAddress":storyAddress, 
            "title":title,
            "mainIdea":mainIdea,
            "likes":0,
            "authors":[{"address":accounts[0]}],
            "chapters":[],
            "previousStoryHashes":[],
            "drafts":[]
          }

          const response = await fetch("../api/createStoryIPFS",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
              },
            body: JSON.stringify(storyJSON)
              });

          setMainIdea("");
          setTitle("");
    }catch(err){
        setError(err.message);
    }
    setLoading(false);
    };




    return(
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
                <Message error header="Oops!" content= {error}/>
                <Button loading={loading} primary type="submit">Create!</Button>
                
            </Form>
        </div>


    );

}


export default CreateStory;