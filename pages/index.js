import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import {Table} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateStory from '../components/createStory';
import web3 from '../ethereum/web3';
import Story from '../ethereum/story';
import { Link } from '../routes.js'


const StoryIndex = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        async function fetchStories() {
            const fetchedStories = await factory.methods.getDeployedStories().call();
            setStories(fetchedStories);
        }
        fetchStories();
    }, []);

    const renderStories = () => {
        return (
            <Table striped bordered hover style={{marginTop:"10px"}}>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Title</th>
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
                            <td></td> {/* Name cell */}
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
