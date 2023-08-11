import { type NextApiRequest, type NextApiResponse } from "next";
import { get } from '@vercel/edge-config';
import { getTreeRoot } from "~src/server/utils/whitelistMerkleUtils";


// @todo add error handling
export default async function getRoot (req: NextApiRequest, res: NextApiResponse) {
  const data: string[] | undefined = await get("whitelist");

  if (!data) {
    throw `no data returned. data: ${data}`;
  }

  const root: string = getTreeRoot(data);

  res.status(200).json({ root });
}
