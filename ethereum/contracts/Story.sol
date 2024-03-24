// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract StoryFactory {
    address[] public deployedStories;

        function createStory(string memory _mainIdea) public {
        Story newStory = new Story(_mainIdea, msg.sender);
        deployedStories.push(address(newStory));
    }


    function getDeployedStories() public view returns (address[] memory) {
        return deployedStories;
    }
}

contract Story {
    string public mainIdea;
    string[] public storyStrings;
    mapping(address => bool) public authorsForSolidity;
    address[] public authorsForReact;


    struct RequestToJoin {
        string proposal;
        uint256 timestamp;
        address author;
    }

    RequestToJoin[] public requestsToJoin;

    constructor(string memory _mainIdea, address _mainAuthor) {
        mainIdea = _mainIdea;
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

        authorsForSolidity[requestsToJoin[_index].author] = true;
        authorsForReact.push(requestsToJoin[_index].author);

        // Remove the struct from the array
        delete requestsToJoin[_index];
    }

    function addChapter(string memory _chapter) public {
        require(authorsForSolidity[msg.sender], "Only an accepted author can add a chapter");

        storyStrings.push(_chapter);
    }

    function getSummary() public view returns (
        string memory, string[] memory, address[] memory, RequestToJoin[] memory) {
        return ( 
            mainIdea,
            storyStrings,
            authorsForReact,
            requestsToJoin
        );
    }

    function isAuthor() public view returns (bool){
        return authorsForSolidity[msg.sender];
    }

        
}


