// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract StoryFactory {
    address[] public deployedStories;

        function createStory() public returns (address){
        Story newStory = new Story(msg.sender);
        deployedStories.push(address(newStory));
        return address(newStory);
    }


    function getDeployedStories() public view returns (address[] memory) {
        return deployedStories;
    }
}

contract Story {
    mapping(address => bool) public authorsForSolidity;
    address[] public authorsForReact;


    struct RequestToJoin {
        string proposal;
        uint256 timestamp;
        address author;
    }

    RequestToJoin[] public requestsToJoin;

    constructor(address _mainAuthor) {
        authorsForSolidity[_mainAuthor] = true;
        authorsForReact.push(_mainAuthor);
    }

    function createRequestToJoin(string memory _proposal) public {
        require(!authorsForSolidity[msg.sender], "Author already exists in the list of authors");

        RequestToJoin memory newRequest = RequestToJoin({
            proposal: _proposal,
            timestamp: block.timestamp,
            author: msg.sender
        });

        requestsToJoin.push(newRequest);
    }

    function approveRequestToJoin(uint256 _index) public {
        require(authorsForSolidity[msg.sender], "Only an accepted author can approve a request");
        require(!authorsForSolidity[requestsToJoin[_index].author], "Author of the request is already included in the list of authors");

        uint256 lastIndex = requestsToJoin.length - 1;
        // Swap the request at the given index with the last request in the array
        RequestToJoin memory lastRequest = requestsToJoin[lastIndex];
        requestsToJoin[_index] = lastRequest;
        // Delete the last element by reducing the array length
        requestsToJoin.pop();
        // Update mappings and arrays accordingly
        authorsForSolidity[lastRequest.author] = true;
        authorsForReact.push(lastRequest.author);
    }

    function getSummary() public view returns (
        address[] memory, RequestToJoin[] memory) {
        return ( 
            authorsForReact,
            requestsToJoin
        );
    }

    function isAuthor() public view returns (bool){
        return authorsForSolidity[msg.sender];
    }

        
}


