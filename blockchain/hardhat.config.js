require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002,
    },
    ssafy: {
      url: process.env.RPC_URL || "https://rpc.ssafy-blockchain.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 31221,
    },
  },
};
