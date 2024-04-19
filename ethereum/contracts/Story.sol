// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract StoryFactory {
    address[] public deployedStories;

    
    event StoryCreated(address indexed storyAddress);

    function createStory(string memory usernameAndPassword, string memory pem) public returns (address) {
        Story newStory = new Story(msg.sender, usernameAndPassword, pem);
        deployedStories.push(address(newStory));
        emit StoryCreated(address(newStory));
        return address(newStory);
    }

    function getDeployedStories() public view returns (address[] memory) {
        return deployedStories;
    }
}

contract Story {
    mapping(address => bool) public authorsForSolidity;
    address[] public authorsForReact;
    bool public reported;
    string public usernameAndPassword;
    string public pem;

    struct RequestToJoin {
        string proposal;
        uint256 timestamp;
        address author;
    }

    RequestToJoin[] public requestsToJoin;

    constructor(address _mainAuthor, string memory _usernameAndPassword, string memory _pem) {
        authorsForSolidity[_mainAuthor] = true;
        authorsForReact.push(_mainAuthor);
        reported = false;
        usernameAndPassword = _usernameAndPassword;
        pem = _pem;
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
        address[] memory, RequestToJoin[] memory, bool, string memory, string memory) {
        return ( 
            authorsForReact,
            requestsToJoin,
            reported,
            usernameAndPassword,
            pem
        );
    }

    function isAuthor() public view returns (bool){
        return authorsForSolidity[msg.sender];
    }

        
}


