import { type NextApiRequest, type NextApiResponse } from "next";
import { computeHash, computeProof } from "~src/server/utils/whitelistMerkleUtils";
import { pick } from "lodash";
import { get } from '@vercel/edge-config';


export default async function getHashForWhitelistMint (req: NextApiRequest, res: NextApiResponse) {
  const { key } = pick(req.body, ["key"]) as  { key: string };
  const whitelist: string[] | undefined = await get("whitelist");

  if (!key) {
    throw `error: no key provided. key: ${key}`;
  }

  if (!whitelist) {
    throw `error: no whitelist returned. whitelist: ${whitelist}`
  }

  if (!whitelist.find((item => item === key))) {
    console.log(`${key} not in whitelist`);
    return res.status(404);
  }

  // compute hash of twitter handle
  const hash: string | undefined = await computeHash(key);

  if (!hash) {
    throw `error: no hash returned. hash: ${hash}`;
  }

  let proof: string[] = [];

  try {
    proof = await computeProof(hash, whitelist);
  } catch (err) {
    /** will error here if hash is not found in the whitelist */
    // @anggxyz @todo handle this case
  }


  return res.status(200).json({ hash, proof });
}
