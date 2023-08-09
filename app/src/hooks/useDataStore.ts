/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from 'react';
import axios from "axios";


export const useDataStore = ({ key }: { key: string })=> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState(null);

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
  }, [key])

  return {
    data,
    error,
    loading
  }
};

