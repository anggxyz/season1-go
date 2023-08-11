/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useReducer, useState } from 'react';
import axios from "axios";


export const useDataStore = ({ key }: { key: string }): {
  data: {data: string[]},
  error: string | null,
  loading: boolean,
  refetch: () => void
}=> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{data: string[]}>({data: []});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
  const [_, refetch] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    axios
      .post(`/api/edge/getKey`, { key }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((v) => {
        if (v.data) setData(v.data);
      })
      .catch(() => setError("Error"))
      .finally(() => setLoading(false));
  }, [key, _])

  return {
    data,
    error,
    loading,
    refetch
  }
};

