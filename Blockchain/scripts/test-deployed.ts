import { network } from "hardhat";

const { ethers } = await network.create();

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const voting = await ethers.getContractAt("Voting", contractAddress);

const [owner, voter] = await ethers.getSigners();

console.log("Owner:", owner.address);
console.log("Voter:", voter.address);

await voting.addCandidate(
  "Candidate A",
  "First candidate"
);

console.log("Candidate added");

await voting.authorizeVoter(voter.address);

console.log("Voter authorized");

await voting.startElection();

console.log("Election started");

await voting.connect(voter).castVote(1);

console.log("Vote successfully cast");

const votes = await voting.getCandidateVotes(1);

console.log("Candidate 1 votes:", votes.toString());

const hasVoted = await voting.hasVoted(voter.address);

console.log("Voter has voted:", hasVoted);