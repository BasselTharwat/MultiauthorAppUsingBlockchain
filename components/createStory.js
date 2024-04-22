import React, { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import factory from '../ethereum/factory.js';


const CreateStory = () =>{
    const[mainIdea, setMainIdea] = useState("");
    const[title, setTitle] = useState("");
    const[type, setType] = useState("");
    const[genre, setGenre] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    
    const handleInputChangeMainIdea = (event) => {
        setMainIdea(event.target.value);
    };
    const handleInputChangeTitle = (event) => {
        setTitle(event.target.value);
    };
    const handleInputChangeType = (event) => {
        setType(event.target.value);
    };
    const handleInputChangeGenre = (event) => {
        setGenre(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try{      
            

        const controller = new AbortController()
            // many minutes timeout:
        const timeoutId = setTimeout(() => controller.abort(), 5000000)

        const response = await fetch("../api/createKeyIPFS",{
            method: "POST",
            signal: controller.signal
                });
        const credentials = await response.json();        
        const { usernameAndPassword, pem } = credentials;

        //create a story on the blockchain
        const accounts = await web3.eth.getAccounts();
        const gasEstimate = await factory.methods.createStory(usernameAndPassword, pem).estimateGas({
            from: accounts[0]
          });
    
        const encode = await factory.methods.createStory(usernameAndPassword, pem).encodeABI();

        const transactionReceipt = await factory.methods.createStory(usernameAndPassword, pem).send({
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
            "type":type,
            "genre":genre,
            "title":title,
            "mainIdea":mainIdea,
            "likes":[],//stores account addresses of likers
            "reports":[],//stores account addresses of reporters
            "reported": false,
            "authors":[accounts[0]],//stores account addresses of authors
            "chapters":[],
            "drafts":[],
            "timestamp":Date.now()
          }


          await fetch("../api/createOrUpdateStoryIPFS",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
              },
            body: JSON.stringify({usernameAndPassword: usernameAndPassword,
                pem: pem,
                storyJSON: storyJSON}),
            signal: controller.signal
              });

          setMainIdea("");
          setTitle("");
          setGenre("");
          setType("");
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
                <Form.Field>
                    <label>Choose the type of your story (Text/Audio/Video/Image)</label>
                    <Input
                        value={type}
                        onChange={handleInputChangeType}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Identify the genre</label>
                    <Input
                        value={genre}
                        onChange={handleInputChangeGenre}
                    />
                </Form.Field>
                <Message error header="Oops!" content= {error}/>
                <Button loading={loading} primary type="submit">Create!</Button>
                
            </Form>
        </div>


    );

}


export default CreateStory;