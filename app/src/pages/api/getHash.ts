import { type NextApiRequest, type NextApiResponse } from "next";
import { computeHash, computeProof } from "~src/server/utils/whitelistMerkleUtils";
import { pick } from "lodash";
import { get } from '@vercel/edge-config';


export default async function getHash (req: NextApiRequest, res: NextApiResponse) {
  const { key } = pick(req.body, ["key"]) as  { key: string };
  const whitelist: string[] | undefined = await get("whitelist");

  if (!key) {
    throw `error: no key provided. key: ${key}`;
  }

  const hash: string | undefined = computeHash(key);

  if (!hash) {
    throw `error: no hash returned. hash: ${hash}`;
  }

  if (!whitelist) {
    throw `error: no whitelist returned. whitelist: ${whitelist}`
  }

  let proof: string[] = [];

  try {
    proof = computeProof(hash, whitelist);
  } catch (err) {}


  res.status(200).json({ hash, proof });
}