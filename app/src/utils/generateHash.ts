import { randomBytes } from "crypto";

export const getHash = (username: string | undefined | null) => {
  if (!username) return undefined;
  // generate hash for a given username
  return "0x" + randomBytes(32).toString("hex");
}

export const generateMerkleTree = (whitelist: string[]) => {
  // get hash associated with each username in the whitelist
  // generate a merkle tree
  // return root
}
