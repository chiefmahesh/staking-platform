const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying MyToken with account:", deployer.address);

    const initialSupply = hre.ethers.utils.parseEther("1000000"); // 1 Million Tokens
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(initialSupply);

    await myToken.deployed();
    console.log("MyToken deployed at:", myToken.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

