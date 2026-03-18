require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "a".repeat(64);
const SSAFY_RPC_URL = process.env.SSAFY_RPC_URL || "https://rpc.ssafy-blockchain.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    ssafy: {
      url: SSAFY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 31221,
    },
  },
};
