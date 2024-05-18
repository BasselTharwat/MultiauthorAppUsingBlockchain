// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;



    contract StoryFactory {

        address[] public deployedStories;
        mapping(address => string) public authorUsernames;

        function createStory(string memory _title, string memory _mainIdea, string memory _coverPhoto) public {
            Story newStory = new Story(msg.sender, _title, _mainIdea, _coverPhoto);
            deployedStories.push(address(newStory));
        }

        function getDeployedStories() public view returns (address[] memory) {
            return deployedStories;
        }

        function addAuthorUsername(string memory username) public {
            authorUsernames[msg.sender] = username;
        }   
    }

    contract Story {
        string public title;
        string public mainIdea;
        string public coverPhoto;
        bool private _locked;

        mapping(address => bool) public authorsForSolidity;
        address[] public authorsForReact;
        mapping(address => bool) public chaptersForSolidity;
        address[] public chaptersForReact;

        struct RequestToJoin {
            string proposal;
            address author;
            mapping(address => bool) approvers;
            uint approversCount;
            bool status;
        }

        RequestToJoin[] public requestsToJoin;

        struct RequestToBuy {
            uint price;
            address bidder;
            mapping(address => bool) approvers;
            uint approversCount;
            bool status;
        }

        RequestToBuy[] public requestsToBuy;

        address public owner;
        bool public bought;


        modifier noReentrancy() {
            require(!_locked, "Reentrant call");
            _locked = true;
            _;
            _locked = false;
        }

        constructor(address _mainAuthor, string memory _title, string memory _mainIdea, string memory _coverPhoto) payable{
            authorsForSolidity[_mainAuthor] = true;
            authorsForReact.push(_mainAuthor);
            title = _title;
            mainIdea = _mainIdea;
            coverPhoto = _coverPhoto;
        }

        function createRequestToBuy() public payable noReentrancy { //make price in wei
            require(!bought, "This story has been bought");
            RequestToBuy storage newRequest = requestsToBuy.push();
            newRequest.price = msg.value;
            newRequest.bidder = msg.sender;
        }
        function approveRequestToBuy(uint256 _index) public payable noReentrancy {
            require(!bought, "This story has been bought");
            require(authorsForSolidity[msg.sender], "Only an accepted author can approve a request");

            RequestToBuy storage request = requestsToBuy[_index];

            require(!request.approvers[msg.sender], "This author already approved before");
            require(!request.status, "This request has already been approved before");

            request.approvers[msg.sender] = true;
            request.approversCount = request.approversCount + 1;

            //if half the authors approved, requestor buys the story
            if (request.approversCount > (authorsForReact.length / 2) ) {
                request.status = true;
                owner = request.bidder;
                bought = true;
                
                //transfer money to authors
                uint256 amountPerAuthor = request.price / authorsForReact.length;
                uint256 i = 0;
                while (i < authorsForReact.length) {
                    payable(authorsForReact[i]).transfer(amountPerAuthor);
                    i++;
                }

                //refund money to bidders
                i = 0;
                while (i < requestsToBuy.length){
                    if(requestsToBuy[i].status == false){ 
                        payable(requestsToBuy[i].bidder).transfer(requestsToBuy[i].price);
                    }
                    i++;
                }

                
            }
            
        } 

        function createRequestToJoin(string memory _proposal) public noReentrancy {
            require(!bought, "This story has been bought");
            require(!authorsForSolidity[msg.sender], "Author already exists in the list of authors");
            RequestToJoin storage newRequest = requestsToJoin.push();
            newRequest.proposal = _proposal;
            newRequest.author = msg.sender;
        }
        

        function approveRequestToJoin(uint256 _index) public noReentrancy {
            require(!bought, "This story has been bought");
            require(authorsForSolidity[msg.sender], "Only an accepted author can approve a request");

            RequestToJoin storage request = requestsToJoin[_index];

            require(!request.approvers[msg.sender], "This author already approved before");
            require(!request.status, "This request has already been approved before");

            request.approvers[msg.sender] = true;
            request.approversCount = request.approversCount + 1;

            //if half the authors approved, add this author to the story
            if (request.approversCount > (authorsForReact.length / 2) ) {
                // Update mappings and arrays accordingly
                authorsForSolidity[request.author] = true;
                authorsForReact.push(request.author);
                request.status = true;
            }
        }

        function createChapter(string memory _title, string memory _ipfsHash, address _parentChapter, address _childChapter) public noReentrancy {
            require(!bought, "This story has been bought");
            require(authorsForSolidity[msg.sender], "Only an accepted author can create a chapter");
            require(chaptersForSolidity[_parentChapter] || (_parentChapter == address(0)), "Parent chapter must belong to the same story");
            require(chaptersForSolidity[_childChapter] || (_childChapter == address(0)), "Child chapter must belong to the same story");

            Chapter newChapter = new Chapter(msg.sender, address(this), _title, _ipfsHash, _parentChapter, _childChapter);
            if (_parentChapter != address(0)) {
                Chapter parent = Chapter(_parentChapter);
                parent.linkChildChapter(address(newChapter));
            }
            if (_childChapter != address(0)) {
                Chapter child = Chapter(_childChapter);
                child.linkParentChapter(address(newChapter));
            }
            chaptersForReact.push(address(newChapter));
            chaptersForSolidity[address(newChapter)] = true;
        }

        function getSummary() public view returns (
            string memory, string memory, address[] memory, address[] memory, uint, string memory, uint, bool, address) {
            return (
                title,
                mainIdea,
                authorsForReact,
                chaptersForReact,
                requestsToJoin.length,
                coverPhoto,
                requestsToBuy.length,
                bought,
                owner
            );
        }

    }
    contract Chapter {

        address public story;
        address public author;
        string public title;
        string public ipfsHash;
        address[] public linkedParentChapters;
        address[] public linkedChildChapters;
        mapping(address => bool) likers;
        uint256 public likeCount;

        constructor(address _author, address _story, string memory _title, string memory _ipfsHash, address parentChapter, address childChapter) {
            author = _author;
            story = _story;
            ipfsHash = _ipfsHash;
            title = _title;
            if (parentChapter != address(0)) {
                linkedParentChapters.push(parentChapter);
            }
            if (childChapter != address(0)) {
                linkedChildChapters.push(childChapter);
            }
        }

        function linkChildChapter(address childChapter) public {
            require(msg.sender == story, "This function has to be called from the story contract by an accepted author only");
            linkedChildChapters.push(childChapter);
        }

        function linkParentChapter(address parentChapter) public {
            require(msg.sender == story, "This function has to be called from the story contract by an accepted author only");
            linkedParentChapters.push(parentChapter);
        }

        function like() public {
            require(!likers[msg.sender], "You liked this story before");
            likers[msg.sender] = true;
            likeCount++;
        }

        function getSummary() public view returns (
            address, address, string memory, string memory, address[] memory, address[] memory, uint) {
            return (
                story,
                author,
                title,
                ipfsHash,
                linkedParentChapters,
                linkedChildChapters,
                likeCount
            );
        }
    }