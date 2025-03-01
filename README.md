# staking-platform
<img src="https://github.com/chiefmahesh/staking-platform/blob/main/staking.png" alt="Screenshot">

Step 1: Install Required Dependencies
Ensure you have the following installed:

1. Install Node.js & npm
Check if you have Node.js installed:

bash
Copy
Edit
node -v
npm -v
If not, install Node.js (LTS version) from Node.js official site.

Alternatively, install via Homebrew:

bash
Copy
Edit
brew install node
2. Install Hardhat & Dependencies
bash
Copy
Edit
mkdir staking-platform && cd staking-platform
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
Initialize Hardhat:

bash
Copy
Edit
npx hardhat
Choose Create an empty hardhat.config.js.

Step 2: Start a Local Blockchain
Use Hardhat Network for local development:

bash
Copy
Edit
npx hardhat node
This will start a local Ethereum blockchain on localhost:8545.

It will generate test accounts with private keys and ETH balance.

Step 3: Deploy the Smart Contract Locally
1. Write the Staking Contract
Inside the staking-platform folder, create contracts/TokenStaking.sol and paste:

solidity
Copy
Edit
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenStaking is Ownable {
    IERC20 public stakingToken;
    uint256 public rewardRate = 100; // Example reward rate
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake zero");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender] += amount;
        rewards[msg.sender] += (amount * rewardRate) / 1000;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient balance");
        stakes[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");
        rewards[msg.sender] = 0;
        stakingToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }
}
2. Configure Hardhat
Edit hardhat.config.js:

javascript
Copy
Edit
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
3. Deploy the Contract
Create a new file scripts/deploy.js:

javascript
Copy
Edit
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const TokenStaking = await hre.ethers.getContractFactory("TokenStaking");
    const staking = await TokenStaking.deploy("0xYourTokenAddress"); // Replace with token address

    await staking.deployed();
    console.log("Staking Contract deployed at:", staking.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
Deploy the contract to the local Hardhat network:

bash
Copy
Edit
npx hardhat run scripts/deploy.js --network localhost
After deployment, note the contract address.

Step 4: Start the Frontend Locally
1. Setup React Frontend
Inside your staking-platform folder:

bash
Copy
Edit
npx create-react-app frontend
cd frontend
npm install ethers web3 @mui/material
2. Update App.js
Edit frontend/src/App.js:

javascript
Copy
Edit
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const stakingAddress = "DEPLOYED_CONTRACT_ADDRESS"; // Replace with your contract address
const stakingAbi = [ /* ABI JSON Here */ ]; // Replace with the contract ABI

function App() {
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState("0");
    const [rewards, setRewards] = useState("0");
    const [wallet, setWallet] = useState(null);

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setWallet(await signer.getAddress());
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);
        setBalance((await stakingContract.stakes(wallet)).toString());
        setRewards((await stakingContract.rewards(wallet)).toString());
    }

    async function stakeTokens() {
        if (!wallet) return alert("Connect your wallet first!");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);
        await stakingContract.stake(ethers.utils.parseEther(amount));
        alert("Stake successful!");
    }

    async function unstakeTokens() {
        if (!wallet) return alert("Connect your wallet first!");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);
        await stakingContract.unstake(ethers.utils.parseEther(amount));
        alert("Unstake successful!");
    }

    async function claimRewards() {
        if (!wallet) return alert("Connect your wallet first!");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);
        await stakingContract.claimReward();
        alert("Rewards claimed!");
    }

    return (
        <div>
            <h1>Staking Platform</h1>
            <button onClick={connectWallet}>Connect Wallet</button>
            <p>Balance: {balance}</p>
            <p>Rewards: {rewards}</p>
            <input type="text" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
            <button onClick={stakeTokens}>Stake</button>
            <button onClick={unstakeTokens}>Unstake</button>
            <button onClick={claimRewards}>Claim Rewards</button>
        </div>
    );
}

export default App;
3. Run the Frontend
Inside the frontend folder:

bash
Copy
Edit
npm start
Step 5: Test Transactions
Connect MetaMask (use localhost network in MetaMask).
Stake Tokens and check your balance.
Unstake Tokens and claim rewards.


