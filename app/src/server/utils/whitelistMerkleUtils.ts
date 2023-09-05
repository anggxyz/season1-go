import { MerkleTree } from "~src/server/utils/merkle";
import { ethers, hashMessage } from "ethers";
import Web3 from "web3";

const { utils } = Web3;

const deployer = process.env.PRIVATE_KEY;
if (!deployer) {
  throw "PRIVATE_KEY not found";
}
const ADMIN = new ethers.Wallet(deployer);

// used to generate signature for both public
// and whitelist mints
// for whitelist mints, these signatures
// combine to form a merkle tree
// signatures are verified against the root
// on the smart contract
export const getSignature = async(element: string) => {
  const hash = hashMessage(element);
  const signature = await ADMIN.signMessage(element);
  return { hash, signature };
}

export const computeHash = async (element: string) => {
  const { signature } = await getSignature(element);
  return utils.soliditySha3(signature);
}

export const compressElements = async (elements: string[]) => {
  const hashPromises = elements.map(d => computeHash(d));
  const compressed = await Promise.all(hashPromises);
  return compressed;
}

export const getTreeRoot = async (elements: string[]) => {
  const compressed = await compressElements(elements);
  const tree = new MerkleTree(compressed);
  const root: string = tree.getHexRoot() as string;
  return root;
}

export const computeProof = async (element: string, allElements: string[]) => {
  const compressed = await compressElements(allElements)
  const tree = new MerkleTree(compressed);
  const proof = tree.getHexProof(element) as string[];
  return proof;
}
