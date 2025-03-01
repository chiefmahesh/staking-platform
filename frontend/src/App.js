import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import stakingJson from "./TokenStaking.json";

const stakingAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with deployed contract address
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
