/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useReducer, useState } from 'react';
import axios from "axios";


export const useMerkleRoot = (): {
  root: string,
  error: string | null,
  loading: boolean,
  refetch: () => void
}=> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [root, setRoot] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
  const [_, refetch] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    axios.post<{root: string}>(`/api/getRoot`, {
        headers: { "Content-Type": "application/json" }
      })
      .then((v) => {
        if (v.data) setRoot(v.data.root);
      })
      .catch(() => setError("Error"))
      .finally(() => setLoading(false));
  }, [_])

  return {
    root,
    error,
    loading,
    refetch
  }
};

