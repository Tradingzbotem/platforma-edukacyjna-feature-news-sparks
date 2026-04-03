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
    `deploy.ts: unsupported network "${networkName}". Use polygonAmoy, polygon, or hardhat.`
  );
}

async function main() {
  const networkName = hre.network.name;
  const rpcUrl = rpcUrlForNetwork(networkName);
  const privateKey = requireEnv("PRIVATE_KEY");

  const name = requireEnv("NFT_NAME");
  const symbol = requireEnv("NFT_SYMBOL");
  const maxSupplyStr = requireEnv("NFT_MAX_SUPPLY");
  const baseURI = requireEnv("NFT_BASE_URI");
  const initialOwner = requireEnv("INITIAL_OWNER");

  const maxSupply = BigInt(maxSupplyStr);
  if (maxSupply <= 0n) {
    throw new Error("NFT_MAX_SUPPLY must be a positive integer");
  }

  const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
  const wallet = new hre.ethers.Wallet(privateKey, provider);

  console.log("Network:", networkName);
  console.log("Deploying with account:", wallet.address);
  console.log("Initial owner (constructor):", initialOwner);

  const Factory = await hre.ethers.getContractFactory("FoundersNFT", wallet);
  const contract = await Factory.deploy(name, symbol, maxSupply, baseURI, initialOwner);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("FoundersNFT deployed to:", address);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
