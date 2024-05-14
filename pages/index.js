import React from 'react';
import Layout from '../components/layout';
import factory from '../ethereum/factory';
import Story from '../ethereum/story';
import { Card, Button, Row, Col } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from '../routes';
import Files from '../components/Files';

const StoryIndex = ({ stories }) => {
    const renderStories = () => {
        if (!stories || stories.length === 0) {
            return <p>No stories found.</p>;
        } else {
            return (
                <div style={{marginTop:"20px"}}> 
                    <Row className="gap-2">
                        {stories.map(story => (
                            <Col key={story.storyAddress} className="d-flex">
                                <Card className="h-100" style={{ width: "20rem" }}>
                                    <Files chapterCid={story.coverPhotoIpfsHash} />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="text-truncate" style={{ maxWidth: "100%" }}>{story.title}</Card.Title>
                                        <Card.Text className="text-truncate" style={{ maxWidth: "100%", flex: "1 1 auto" }}>{story.mainIdea}</Card.Text>
                                        <Card.Footer className='text-truncate' style={{ maxWidth: "100%" }}>{story.genre}</Card.Footer>
                                        <Link route={`/stories/${story.storyAddress}`}>
                                            <Button style={{marginTop: '10px'}} variant="secondary">Read Story</Button>
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            );
        }
    };

    return (
        <Layout>
            
            {renderStories()}
            <div style={{ position: "fixed", bottom: "30px", right: "50px" }}>
                <Link route="/createStory">
                    <Button variant="primary" style={{ width: "200px", height: "50px" }}>Create Your Story</Button>
                </Link>
            </div>
        </Layout>
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
                title: summary[0],
                genre: summary[1],
                mainIdea: summary[2],
                authors: summary[3],
                chapters: summary[4],
                requestsToJoinCount: Number(summary[5]),
                reportersCount: Number(summary[6]),
                reported: summary[7],
                coverPhotoIpfsHash: summary[8],
                requestsToBuyCount: Number(summary[9]),
                bought: summary[10],
                owner: summary[11]

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
