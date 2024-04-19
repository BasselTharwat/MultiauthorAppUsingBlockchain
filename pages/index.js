import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import {Table} from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateStory from '../components/createStory';
import Story from '../ethereum/story';
import { Link } from '../routes.js'


const StoryIndex = () => {
    const [stories, setStories] = useState([]);
    const [storiesJSON,setStoriesJSON] = useState([]); 

    useEffect(() => {
        async function fetchStories() {
            const fetchedStories = await factory.methods.getDeployedStories().call();
            setStories(fetchedStories); 
            let story;
            let summary;  
            for (let i = 0; i < stories.length; i++) {
                story = Story(stories[i]);
                summary = await story.methods.getSummary().call(); 
  
                const response = await fetch("/api/fetchStoryFromIPFS", {
                    method: "POST",   
                    headers: {  
                        "Content-Type": "application/json"  
                    },
                    body: JSON.stringify({usernameAndPassword: summary[3], pem: summary[4]})
                }); 
 
                const responseJSON = await response.json();  
                console.log(responseJSON);      
                const { storyJSON } = responseJSON;
                console.log(storyJSON);
                
                }
        }
        fetchStories();
    }, []);

    const renderStories = () => {
        return (
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {stories.map(address => (
                        <tr key={address}>
                            <td>{<Link route={`/stories/${address}/viewStory`}>
                                    <a>
                                        {address}
                                    </a>
                                </Link>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>    
        );
    };
    
    return (
        <div>
            <Layout>
                <h2>Stories</h2>  
                {renderStories()}  
                <CreateStory/>
            </Layout>
        </div>
    );
};

export default StoryIndex;
