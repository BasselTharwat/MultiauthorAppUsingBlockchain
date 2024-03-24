import React, { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import factory from '../ethereum/factory.js';
import web3 from '../ethereum/web3.js';

const CreateStory = () =>{
    const[mainIdea, setMainIdea] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    
    const handleInputChange = (event) => {
        setMainIdea(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try{
        const accounts = await web3.eth.getAccounts();
        const gasEstimate = await factory.methods.createStory(mainIdea).estimateGas({
            from: accounts[0]
          });
    
          const encode = await factory.methods.createStory(mainIdea).encodeABI();
        
          await factory.methods.createStory(mainIdea).send({
            from: accounts[0],
            gas: gasEstimate.toString(),
            data: encode
          });

          setMainIdea("");
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
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Message error header="Oops!" content= {error}/>
                <Button loading={loading} primary type="submit">Create!</Button>
                
            </Form>
        </div>


    );

}


export default CreateStory;