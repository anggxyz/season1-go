/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useReducer, useState } from 'react';
import axios from "axios";

// key = twitter username
export const useComputeHash = ({ key }: { key?: string }): {
  hash?: string,
  proof?: string,
  error: string | null,
  loading: boolean,
  refetch: () => void
}=> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hash, setRoot] = useState<string | undefined>(undefined);
  const [proof, setProof] = useState<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
  const [_, refetch] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!key) return;
    axios.post<{hash: string, proof: string}>(`/api/getHash`, { key }, {
        headers: { "Content-Type": "application/json" }
      })
      .then((v) => {
        if (v.data) {
          setRoot(v.data.hash);
          setProof(v.data.proof);
        }
      })
      .catch(() => setError("Error"))
      .finally(() => setLoading(false));
  }, [key, _])

  return {
    hash,
    proof,
    error,
    loading,
    refetch
  }
};

