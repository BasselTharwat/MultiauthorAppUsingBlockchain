// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }

}

contract StoryFactory {
    address[] public deployedStories;
    mapping(address => string) public authorUsernames;

    function createStory(string memory _title, string memory _genre, string memory _mainIdea) public {
        Story newStory = new Story(msg.sender, _title, _genre, _mainIdea);
        deployedStories.push(address(newStory));
    }

    function getDeployedStories() public view returns (address[] memory) {
        return deployedStories;
    }

    function addAuthorUsername(string memory username) public{
        authorUsernames[msg.sender] = username;
    }

    //function getAuthorUsername(address authorAddress) public view returns (string memory){
    //    return authorUsernames[authorAddress];
    //}


}

contract Story {
    using SafeMath for uint256;

    address mainAuthor;
    string title;
    string genre;
    string mainIdea;
    mapping(address => bool) public authorsForSolidity;
    address[] public authorsForReact;
    mapping(address => bool) public chaptersForSolidity;
    address[] public chaptersForReact;
    bool private _locked;
    mapping(address => bool) reporters;
    uint reportersCount;
    bool public reported;

    struct RequestToJoin {
        string proposal;
        uint256 timestamp;
        address author;
        mapping(address => bool) approvers;
        uint approversCount;
        bool status;
    }

    RequestToJoin[] public requestsToJoin;

    constructor(address _mainAuthor, string memory _title, string memory _genre, string memory _mainIdea) {
        mainAuthor = _mainAuthor;
        authorsForSolidity[_mainAuthor] = true;
        authorsForReact.push(_mainAuthor);
        title = _title;
        genre = _genre;
        mainIdea = _mainIdea;
        reported = false;
    }

    function createRequestToJoin(string memory _proposal) public noReentrancy{
        require(!reported, "This story has been reported");
        require(!authorsForSolidity[msg.sender], "Author already exists in the list of authors");
        RequestToJoin storage newRequest = requestsToJoin.push();
        newRequest.proposal = _proposal;
        newRequest.timestamp = block.timestamp;
        newRequest.author = msg.sender;
        newRequest.approversCount = 0;
        newRequest.status = false;
    }

    function approveRequestToJoin(uint256 _index) public noReentrancy{
        require(!reported, "This story has been reported");
        require(authorsForSolidity[msg.sender], "Only an accepted author can approve a request");
        require(_index < requestsToJoin.length && _index>=0, "Index out of bounds");

        RequestToJoin storage request = requestsToJoin[_index];

        require(!request.approvers[msg.sender],"This author already approved before");

        request.approvers[msg.sender] = true;
        request.approversCount = request.approversCount.add(1);

        //if half the authors approved, add this author to the story
        if(request.approversCount >= (authorsForReact.length)/2){
            request.status = true;
            // Update mappings and arrays accordingly
            authorsForSolidity[request.author] = true;
            authorsForReact.push(request.author);
        }
    }

    function createChapter(string memory _title,  string memory _ipfsHash, address _parentChapter, address _childChapter) public noReentrancy{
        require(!reported, "This story has been reported");
        require(authorsForSolidity[msg.sender], "Only an accepted author can create a chapter");
        require(isContract(_parentChapter), "Parent chapter must be a contract");
        require(isContract(_childChapter), "Child chapter must be a contract");
        require(checkParentChapter(_parentChapter), "Parent chapter must belong to the same story");
        require(checkChildChapter(_childChapter), "Child chapter must belong to the same story");

        Chapter newChapter = new Chapter(msg.sender, address(this), _title,  _ipfsHash, _parentChapter, _childChapter);
        if(_parentChapter != address(0)){
                Chapter parent = Chapter(_parentChapter);
                parent.linkChildChapter(address(newChapter));
            }
        if(_childChapter != address(0)){
                Chapter child = Chapter(_childChapter);
                child.linkParentChapter(address(newChapter));
            }
        chaptersForReact.push(address(newChapter));
        chaptersForSolidity[address(newChapter)] = true;


    }

    function contribute() public payable noReentrancy{
        require(msg.value >= 100, "Minimum contribution is 100 Wei");
        //payable(address(this)).transfer(msg.value);
    }

    function dispenseRewards() public noReentrancy{
        require(authorsForSolidity[msg.sender], "Only an authorized author can dispense rewards");

        uint256 totalAuthors = authorsForReact.length;
        uint256 rewardPerAuthor = address(this).balance.div(totalAuthors);
        require(rewardPerAuthor > 0, "No reward to dispense");
        for (uint256 i = 0; i < totalAuthors; i++) {
            payable(authorsForReact[i]).transfer(rewardPerAuthor);
        }
    }


    function report() public noReentrancy{
        require(!reported, "This story has been reported");
        require(!reporters[msg.sender],"You have reported this story before");
        reportersCount.add(1);
        reporters[msg.sender] = true;

        if(reportersCount > 100){ //arbitrary number
            reported = true;
        }
    }
    

    function getChapters() public view returns (address[] memory) {
        return chaptersForReact;
    }

    
    function getSummary() public view returns (
        address, string memory, string memory, string memory, address[] memory, address [] memory, uint, uint, bool, uint) {
        return ( 
            mainAuthor,
            title,
            genre,
            mainIdea,
            authorsForReact,
            chaptersForReact,
            requestsToJoin.length,
            reportersCount,
            reported,
            address(this).balance
        );
    }

    function isAuthor() public view returns (bool){
        return authorsForSolidity[msg.sender];
    }

    //check that parentChapter belongs to the same story
    function checkParentChapter(address parentChapter) internal view returns (bool){
        if(parentChapter == address(0)){
            return true;
        }
        return chaptersForSolidity[parentChapter];
    }
    //check that childChapter belongs to the same story
    function checkChildChapter(address childChapter) internal view returns (bool){
        if(childChapter == address(0)){
            return true;
        }
        return chaptersForSolidity[childChapter];
    }

    function isContract(address account) internal view returns (bool) {
        // Exclude the zero address as it is not a contract
        if (account == address(0)) {
            return true;
        }
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }


    modifier noReentrancy() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
}

contract Chapter {
    using SafeMath for uint256;

    address public story; 
    address public author;
    string public title;
    string public ipfsHash;
    address[] public linkedParentChapters;
    address[] public linkedChildChapters;
    mapping(address => bool) likers;
    uint256 public likeCount;

    constructor(address _author, address _story, string memory _title,  string memory _ipfsHash, address parentChapter, address childChapter) {
        author = _author;
        story = _story;
        ipfsHash = _ipfsHash;
        title = _title;
        if(parentChapter != address(0)){
            linkedParentChapters.push(parentChapter);
        }
        if(childChapter != address(0)){
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
        require(!likers[msg.sender],"You liked this story before");
        likers[msg.sender] = true;
        likeCount = likeCount.add(1);
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
