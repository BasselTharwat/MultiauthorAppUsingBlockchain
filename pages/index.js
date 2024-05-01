import React from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import Story from '../ethereum/story';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateStory from '../components/CreateStory';
import { Link } from '../routes';

const StoryIndex = ({ stories }) => {

    const renderStories = () => {
        if (!stories || stories.length === 0) {
            return <p>No stories found.</p>;
        } else {
            return (
                <Table striped bordered hover style={{ marginTop: "10px" }}>
                    <thead>
                        <tr>
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
                                    <Link route={`/stories/${story.storyAddress}`}>
                                        <a>{story.title}</a>
                                    </Link>
                                </td>
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
                <CreateStory />
            </Layout>
        </div>
    );
};

export async function getServerSideProps() {
    try {
        const fetchedStories = await factory.methods.getDeployedStories().call();
        const stories = await Promise.all(fetchedStories.map(async (address) => {
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
                requestsToJoinCount: Number(summary[6]),
                reportersCount: Number(summary[7]),
                reported: summary[8],
                balance: Number(summary[9])
            };
        }));
        return {
            props: {
                stories
            }
        };
    } catch (error) {
        console.error('Error fetching stories:', error);
        return {
            props: {
                stories: []
            }
        };
    }
}

export default StoryIndex;
