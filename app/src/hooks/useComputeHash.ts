/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useReducer, useState } from 'react';
import axios from "axios";

interface WhitelistedMintArgs {
  hash: string,
  proof: string
}

interface PublicMintArgs {
  hash: string,
  signature: string
}

// key = twitter username
export const useComputeHash = ({ key }: { key?: string }): {
  whitelistedMintArgs?: WhitelistedMintArgs,
  publicMintArgs?: PublicMintArgs,
  error: string | null,
  loading: boolean,
  refetch: () => void
} => {
  /**
   * check if key (twitter username) is whitelisted
   * if whitelisted, return whitelistedMintArgs
   * if not whitelisted, return publicMintArgs
   */

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [whitelistedMintArgs, setWhitelistedMintArgs] = useState<WhitelistedMintArgs>();
  const [publicMintArgs, setPublicMintArgs] = useState<PublicMintArgs>();


  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
  const [_, refetch] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!key) return;
    axios.post<WhitelistedMintArgs>(`/api/getHashForWhitelistMint`, { key }, {
        headers: { "Content-Type": "application/json" }
      })
      .then((v) => {
        if (v.data) {
          setWhitelistedMintArgs(v.data)
        }
      })
      .catch(() => setError("Error"))
      .finally(() => setLoading(false));
  }, [key, _])

  useEffect(() => {
    if (!key) return;
    axios.post<PublicMintArgs>(`/api/getHashForPublicMint`, { key }, {
        headers: { "Content-Type": "application/json" }
      })
      .then((v) => {
        if (v.data) {
          setPublicMintArgs(v.data)
        }
      })
      .catch(() => setError("Error"))
      .finally(() => setLoading(false));
  }, [key, _])

  return {
    whitelistedMintArgs,
    publicMintArgs,
    error,
    loading,
    refetch
  }
};

