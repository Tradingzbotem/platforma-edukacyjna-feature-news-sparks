import { ethers } from "ethers";
import * as dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return v.trim();
}

function rpcUrlForNetwork(networkName: string): string {
  if (networkName === "polygonAmoy") {
    return requireEnv("RPC_URL");
  }
  if (networkName === "polygon") {
    const u = process.env.POLYGON_RPC_URL?.trim();
    if (u) return u;
    return requireEnv("RPC_URL");
  }
  if (networkName === "hardhat") {
    return "http://127.0.0.1:8545";
  }
  throw new Error(
    `mint.ts: unsupported network "${networkName}". Use polygonAmoy, polygon, or hardhat.`
  );
}

function findAddressInArgv(): string | undefined {
  for (const arg of process.argv) {
    const t = arg.trim();
    if (t.length > 0 && ethers.isAddress(t)) {
      return t;
    }
  }
  return undefined;
}

async function main() {
  const networkName = hre.network.name;
  const rpcUrl = rpcUrlForNetwork(networkName);
  const privateKey = requireEnv("PRIVATE_KEY");
  const contractAddress = requireEnv("NFT_CONTRACT_ADDRESS");

  const cliRecipient = findAddressInArgv();
  const recipient = cliRecipient ?? process.env.MINT_TO?.trim();

  if (!recipient || !ethers.isAddress(recipient)) {
    throw new Error(
      "Set MINT_TO in .env or pass a valid address as the first CLI argument"
    );
  }

  const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
  const wallet = new hre.ethers.Wallet(privateKey, provider);

  const nft = await hre.ethers.getContractAt("FoundersNFT", contractAddress, wallet);

  console.log("Network:", networkName);
  console.log("Minting as:", wallet.address);
  console.log("Recipient:", recipient);

  const tx = await nft.mintFounder(recipient);
  console.log("Tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt?.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
