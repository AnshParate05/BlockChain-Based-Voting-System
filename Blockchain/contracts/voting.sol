// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Voting {
    address public owner;

    event VoteCast(
        address indexed voter,
        uint256 indexed candidateId
    );

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;

    mapping(address => bool) public authorizedVoters;
    mapping(address => bool) public hasVoted;

    bool public electionStarted;
    bool public electionEnded;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner can perform this action"
        );
        _;
    }

    function addCandidate(
        string memory name,
        string memory description
    ) public onlyOwner {
        candidateCount++;

        candidates[candidateCount] = Candidate(
            candidateCount,
            name,
            description,
            0
        );
    }

    function authorizeVoter(address voter) public onlyOwner {
        require(voter != address(0), "Invalid voter address");
        authorizedVoters[voter] = true;
    }

    function castVote(uint256 candidateId) public {
        require(
            electionStarted,
            "Election has not started"
        );

        require(
            !electionEnded,
            "Election has ended"
        );

        require(
            authorizedVoters[msg.sender],
            "Voter is not authorized"
        );

        require(
            !hasVoted[msg.sender],
            "Voter has already voted"
        );

        require(
            candidateId > 0 && candidateId <= candidateCount,
            "Invalid candidate"
        );

        candidates[candidateId].voteCount++;

        hasVoted[msg.sender] = true;
        
        emit VoteCast(msg.sender, candidateId);
    }

    function startElection() public onlyOwner {
        require(!electionStarted, "Election already started");
        require(!electionEnded, "Election has ended");

        electionStarted = true;
    }

    function endElection() public onlyOwner {
        require(electionStarted, "Election has not started");
        require(!electionEnded, "Election already ended");

        electionEnded = true;
    }

    function getCandidateVotes(uint256 candidateId)
        public
        view
        returns (uint256)
    {
        require(
            candidateId > 0 && candidateId <= candidateCount,
            "Invalid candidate"
        );

        return candidates[candidateId].voteCount;
    }

    function getWinner() public view returns (uint256) {
        require(candidateCount > 0, "No candidates");

        uint256 winnerId = 1;
        uint256 highestVotes = candidates[1].voteCount;

        for (uint256 i = 2; i <= candidateCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        return winnerId;
    }
}