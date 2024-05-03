import React from 'react';
import Graph from 'react-graph-vis';

const RenderGraph = (props) => {

    const { allChapters } = props;

    // Create nodes and edges dynamically
    const nodes = allChapters.map((chapter, index) => ({
        id: chapter.address,
        title: chapter[2], 
        ipfsHash: chapter[3] 
    }));

    const edges = [];

    allChapters.forEach(chapter => {
        // Create edges for property 4
        chapter[4].forEach(item => {
            edges.push({ from: item, to: chapter.address });
        });
        // Create edges for property 5
        chapter[5].forEach(item => {
            edges.push({ from: chapter.address, to: item });
        });
    });

    const graph = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                parentCentralization: true,
                sortMethod: 'directed',
                shakeTowards: 'leaves'
            }
        },
        edges: {
            color: "#000000"
        },
        height: "100%",
        interaction: {
            zoomView: false, // Disable zooming
            dragView: true // Enable dragging
        }
    };

    const events = {
        select: function(event) {
            const { nodeId } = event;
            if (nodes.length > 0) {
                const nodeId = nodes[0]; // Get the ID of the first selected node
                console.log("Selected node ID:", nodeId);
            }
        }
    };

    return (
        <Graph
            graph={graph}
            options={options}
            events={events}
        />
    );
};

export default RenderGraph;
