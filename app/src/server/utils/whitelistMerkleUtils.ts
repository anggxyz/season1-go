import { MerkleTree } from "~src/server/utils/merkle";
import Web3 from "web3";
const { utils } = Web3;

export const compressElements = (elements: string[]) => elements.map(d => computeHash(d));

export const getTreeRoot = (elements: string[]) => {
  const tree = new MerkleTree(compressElements(elements));
  const root: string = tree.getHexRoot() as string;
  return root;
}

export const computeHash = (element: string) => utils.soliditySha3(element);

export const computeProof = (element: string, allElements: string[]) => {
  const tree = new MerkleTree(compressElements(allElements));
  const proof = tree.getHexProof(element) as string[];
  return proof;
}
