import { MerkleTree } from "~src/server/utils/merkle";
import Web3 from "web3";
const { utils } = Web3;

export const getTreeRoot = (elements: string[]) => {
  const compressed = elements.map(d => computeHash(d));
  const tree = new MerkleTree(compressed);
  const root: string = tree.getHexRoot() as string;
  return root;
}

export const computeHash = (element: string) => utils.soliditySha3(element);
