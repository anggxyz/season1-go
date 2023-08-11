import { type NextApiRequest, type NextApiResponse } from "next";
import { get } from '@vercel/edge-config';
import Web3 from "web3";
import { MerkleTree } from "~src/server/utils/merkle";
const { utils } = Web3;


// @todo add error handling
export default async function getRoot (req: NextApiRequest, res: NextApiResponse) {
  const data: string[] | undefined = await get("whitelist");

  if (!data) {
    throw `no data returned. data: ${data}`;
  }

  const compressed = data.map(username => utils.soliditySha3(username));
  const tree = new MerkleTree(compressed);
  const root: string = tree.getHexRoot() as string;

  res.status(200).json({ root });
}
