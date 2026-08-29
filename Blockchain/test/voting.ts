import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Voting", function () {
  it("should allow an authorized voter to cast one vote", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    // Add candidate
    await voting.addCandidate("Candidate A", "Test candidate");

    // Authorize voter
    await voting.authorizeVoter(voter.address);

    // Start election
    await voting.startElection();

    // Cast vote
    await voting.connect(voter).castVote(1);

    // Check vote count
    expect(await voting.getCandidateVotes(1)).to.equal(1);

    // Check voter status
    expect(await voting.hasVoted(voter.address)).to.equal(true);
  });

  it("should reject an unauthorized voter", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.addCandidate("Candidate A", "Test candidate");

    await voting.startElection();

    await expect(
        voting.connect(voter).castVote(1)
    ).to.be.revertedWith("Voter is not authorized");
    });

  it("should reject a voter who tries to vote twice", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.addCandidate("Candidate A", "Test candidate");
    await voting.addCandidate("Candidate B", "Another candidate");

    await voting.authorizeVoter(voter.address);
    await voting.startElection();

    // First vote should succeed
    await voting.connect(voter).castVote(1);

    // Second vote should fail
    await expect(
        voting.connect(voter).castVote(2)
    ).to.be.revertedWith("Voter has already voted");
    });

  it("should reject voting before the election starts", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.addCandidate("Candidate A", "Test candidate");
    await voting.authorizeVoter(voter.address);

    // Election has NOT been started
    await expect(
        voting.connect(voter).castVote(1)
    ).to.be.revertedWith("Election has not started");
    });
    
  it("should reject voting after the election ends", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.addCandidate("Candidate A", "Test candidate");
    await voting.authorizeVoter(voter.address);

    await voting.startElection();
    await voting.endElection();

    await expect(
        voting.connect(voter).castVote(1)
    ).to.be.revertedWith("Election has ended");
    });

  it("should reject an invalid candidate", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.authorizeVoter(voter.address);
    await voting.startElection();

    await expect(
        voting.connect(voter).castVote(1)
    ).to.be.revertedWith("Invalid candidate");
    });

  it("should emit VoteCast event when a vote is cast", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    await voting.addCandidate("Candidate A", "Test candidate");
    await voting.authorizeVoter(voter.address);
    await voting.startElection();

    await expect(
        voting.connect(voter).castVote(1)
    )
        .to.emit(voting, "VoteCast")
        .withArgs(voter.address, 1);
    });
}); 