const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const TokenStaking = await hre.ethers.getContractFactory("TokenStaking");
    const staking = await TokenStaking.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // Replace with token address

    await staking.deployed();
    console.log("Staking Contract deployed at:", staking.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

