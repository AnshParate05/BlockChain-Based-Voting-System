import { network } from "hardhat";

const { ethers } = await network.create();

const voting = await ethers.deployContract("Voting");

await voting.waitForDeployment();

console.log("Voting contract deployed to:", await voting.getAddress());