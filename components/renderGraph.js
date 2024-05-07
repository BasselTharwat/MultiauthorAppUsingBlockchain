import React, { useState } from 'react';
import  Graph  from 'react-graph-vis';

const RenderGraph = (props) => {
    const { allChapters, onNodeSelect } = props;

    // Create nodes and edges dynamically
    const nodes = allChapters.map((chapter, index) => ({
        id: chapter.address,
        label: chapter[2], 
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
            zoomView: true, 
            dragView: true 
        },
        nodes: {
            shape: 'box',
            font: {
                size: 18 
            },
        }
    };

    const events = {
        select: function(event) {
            const { nodes } = event;
            if (nodes.length > 0) {
                const selectedNode = nodes[0]; // Get the ID of the first selected node
                onNodeSelect(selectedNode); // Call the callback function with the selected node ID
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
