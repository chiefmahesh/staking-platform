# staking-platform
<img src="https://github.com/chiefmahesh/staking-platform/blob/main/staking.png" alt="Screenshot">
------------------------------------------------------------------------------------------------
Step 1: Install Required Dependencies
Ensure you have the following installed:

1. Install Node.js & npm
Check if you have Node.js installed:
node -v
npm -v
If not, install Node.js (LTS version) from Node.js official site.

Alternatively, install via Homebrew:
brew install node
2. Install Hardhat & Dependencies

mkdir staking-platform && cd staking-platform
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
Initialize Hardhat:
npx hardhat
Choose Create an empty hardhat.config.js.

Step 2: Start a Local Blockchain
Use Hardhat Network for local development:

npx hardhat node
This will start a local Ethereum blockchain on localhost:8545.

It will generate test accounts with private keys and ETH balance.

Step 3: Deploy the Smart Contract Locally
1. Write the Staking Contract
Inside the staking-platform folder, create contracts/TokenStaking.sol and paste:

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

npx hardhat run scripts/deploy.js --network localhost
After deployment, note the contract address.

Step 4: Start the Frontend Locally
1. Setup React Frontend
Inside your staking-platform folder:

npx create-react-app frontend
cd frontend
npm install ethers web3 @mui/material
2. Update App.js
Edit frontend/src/App.js:

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

npm start

Step 5: 
Test Transactions
Connect MetaMask (use localhost network in MetaMask).
Stake Tokens and check your balance.
Unstake Tokens and claim rewards.

Step 6: Improve UI with Tailwind CSS
We'll use Tailwind CSS for a modern, responsive UI.

1. Install Tailwind in React
Run the following command inside your frontend folder:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
2. Configure Tailwind
Modify tailwind.config.js:

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
3. Import Tailwind in index.css
Open src/index.css and replace its content with:

@tailwind base;
@tailwind components;
@tailwind utilities;
Step 2: Updated App.js with Tailwind UI
Modify src/App.js to use Tailwind and a cleaner UI.

import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import stakingJson from "./TokenStaking.json";

const stakingAddress = "0xYourTokenStakingAddress"; // Replace with deployed contract address
const stakingAbi = stakingJson.abi;

function App() {
    const [amount, setAmount] = useState("");
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState("0");
    const [rewards, setRewards] = useState("0");
    const [transactionHistory, setTransactionHistory] = useState([]);

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWallet(address);
            fetchUserData(signer);
        } catch (error) {
            console.error("Wallet connection error:", error);
        }
    }

    async function fetchUserData(signer) {
        try {
            const stakingContract = new Contract(stakingAddress, stakingAbi, signer);
            const stakedBalance = await stakingContract.stakes(wallet);
            const pendingRewards = await stakingContract.rewards(wallet);
            setBalance(formatEther(stakedBalance));
            setRewards(formatEther(pendingRewards));
            fetchTransactionHistory(signer);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    async function stakeTokens() {
        if (!wallet) return alert("Connect your wallet first!");
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const stakingContract = new Contract(stakingAddress, stakingAbi, signer);
            const tx = await stakingContract.stake(parseEther(amount));
            await tx.wait();
            alert("Stake successful!");
            fetchUserData(signer);
        } catch (error) {
            console.error("Staking error:", error);
            alert("Error: " + (error.reason || error.message));
        }
    }

    async function unstakeTokens() {
        if (!wallet) return alert("Connect your wallet first!");
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const stakingContract = new Contract(stakingAddress, stakingAbi, signer);
            const tx = await stakingContract.unstake(parseEther(amount));
            await tx.wait();
            alert("Unstake successful!");
            fetchUserData(signer);
        } catch (error) {
            console.error("Unstaking error:", error);
            alert("Error: " + (error.reason || error.message));
        }
    }

    async function claimRewards() {
        if (!wallet) return alert("Connect your wallet first!");
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const stakingContract = new Contract(stakingAddress, stakingAbi, signer);
            const tx = await stakingContract.claimReward();
            await tx.wait();
            alert("Rewards claimed!");
            fetchUserData(signer);
        } catch (error) {
            console.error("Claim rewards error:", error);
            alert("Error: " + (error.reason || error.message));
        }
    }

    async function fetchTransactionHistory(signer) {
        try {
            const stakingContract = new Contract(stakingAddress, stakingAbi, signer);
            const filter = stakingContract.filters.Staked(wallet, null);
            const events = await stakingContract.queryFilter(filter, -10000, "latest");
            const formattedEvents = events.map(event => ({
                type: "Stake",
                amount: formatEther(event.args.amount),
                transactionHash: event.transactionHash
            }));
            setTransactionHistory(formattedEvents);
        } catch (error) {
            console.error("Error fetching transaction history:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold mb-5">Staking Platform</h1>
            <button
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
                {wallet ? `Connected: ${wallet.substring(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
            </button>

            {wallet && (
                <div className="mt-5 w-1/3 bg-gray-800 p-5 rounded-lg shadow-lg">
                    <p className="text-lg">Staked Balance: {balance} Tokens</p>
                    <p className="text-lg">Pending Rewards: {rewards} Tokens</p>

                    <input
                        type="text"
                        placeholder="Amount"
                        className="mt-3 w-full p-2 rounded bg-gray-700 text-white"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex justify-between mt-3">
                        <button
                            onClick={stakeTokens}
                            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Stake
                        </button>
                        <button
                            onClick={unstakeTokens}
                            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Unstake
                        </button>
                        <button
                            onClick={claimRewards}
                            className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700"
                        >
                            Claim Rewards
                        </button>
                    </div>

                    <h2 className="mt-5 text-lg font-bold">Transaction History</h2>
                    <ul className="mt-3 space-y-2">
                        {transactionHistory.length > 0 ? (
                            transactionHistory.map((tx, index) => (
                                <li key={index} className="p-2 bg-gray-700 rounded">
                                    {tx.type}: {tx.amount} Tokens
                                    <br />
                                    <a
                                        href={`https://etherscan.io/tx/${tx.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 text-sm"
                                    >
                                        View on Etherscan
                                    </a>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400">No transactions yet.</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;


