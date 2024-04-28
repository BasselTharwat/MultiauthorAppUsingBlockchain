import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import { Table } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateStory from '../components/createStory';
import Story from '../ethereum/story';
import { Link } from '../routes.js'

const StoryIndex = () => {
    const [loading, setLoading] = useState(true);
    const [stories, setStories] = useState([]);

    useEffect(() => {
        async function fetchStories() {
            const fetchedStories = await factory.methods.getDeployedStories().call();
            const storyDetails = await Promise.all(fetchedStories.map(async (address) => {
                const story = Story(address);
                const summary = await story.methods.getSummary().call();
                return {
                    storyAddress: address,
                    mainAuthor: summary[0],
                    title: summary[1],
                    genre: summary[2],
                    mainIdea: summary[3],
                    authors: summary[4].length,
                    chapters: summary[5].length,
                    requestsToJoinCount: summary[6],
                    chapterRequestsCount: summary[7],
                    reportersCount: summary[8],
                    reported: summary[9],
                    balance: summary[10]
                };
            }));
            setStories(storyDetails);
            setLoading(false);
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
                            <th>Main Idea</th>
                            <th>Authors</th>
                            <th>Chapters</th>
                            <th>Reported</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stories.map(story => (
                            <tr key={story.storyAddress}>
                                <td>
                                    <Link route={`/stories/${story.storyAddress}/viewStory`}>
                                        <a>{story.storyAddress}</a>
                                    </Link>
                                </td>
                                <td>{story.title}</td>
                                <td>{story.genre}</td>
                                <td>{story.mainIdea}</td>
                                <td>{story.authors}</td>
                                <td>{story.chapters}</td>
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
