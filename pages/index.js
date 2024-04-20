import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import {Table} from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateStory from '../components/createStory';
import Story from '../ethereum/story';
import { Link } from '../routes.js'
import { useGlobalState } from '../context/storyJSONContext.js';


const StoryIndex = () => {
    const [storiesJSON,setStoriesJSON] = useState([]);
    const [loading, setLoading] = useState(true); 
    const { storyJSON, setStoryJSON } = useGlobalState();
    

    const handleAddressClick = (story) => {
        setStoryJSON(story); // Set the storyJSON state when the address link is clicked
    };


    useEffect(() => {
        async function fetchStories() {
            const fetchedStories = await factory.methods.getDeployedStories().call();
            let story;
            let summary;  
            const fetchedStoriesJSON = [];
            for (let i = 0; i < fetchedStories.length; i++) {
                story = Story(fetchedStories[i]);
                summary = await story.methods.getSummary().call();      

                const response = await fetch("/api/fetchStoryFromIPFS", {
                    method: "POST",   
                    headers: {  
                        "Content-Type": "application/json"  
                    },
                    body: JSON.stringify({usernameAndPassword: summary[2], pem: summary[3]})
                }); 

                const storyJSON = await response.json();  

                console.log(storyJSON);
                fetchedStoriesJSON.push(storyJSON);
            }

            setStoriesJSON(fetchedStoriesJSON); // Update storiesJSON state
            setLoading(false); // Set loading to false
        }
        fetchStories();
    }, []);

    const renderStories = () => {
        if (loading) {
            return <p>Fetching stories...</p>;
        } else {
            return (
                <Table striped bordered hover style={{ marginTop: "10px" }}>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Title</th> 
                        <th>Genre</th>
                        <th>Type</th>
                        <th>Main Idea</th>
                        <th>Likes</th>
                        <th>Authors</th>
                        <th>Reported</th>
                    </tr>
                </thead>
                <tbody>
                    {storiesJSON && storiesJSON.map(story => (
                        <tr key={story.storyAddress}>
                            <td>
                                <Link route={`/stories/${story.storyAddress}/viewStory`}>
                                    <a onClick={() => handleAddressClick(story)}>{story.storyAddress}</a>
                                </Link>
                            </td>
                            <td>{story.title}</td>
                            <td>{story.genre}</td>
                            <td>{story.type}</td>
                            <td>{story.mainIdea}</td>
                            <td>{story.likes.length}</td>
                            <td>{story.authors.length}</td>
                            <td>{story.reported.toString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            );
        }
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



