import { useEffect, useState } from "react";
import axios, { type AxiosResponse } from "axios";

export interface User {
  id: string;
  name: string;
  username: string;
}

export function useMeQuery() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<unknown, AxiosResponse<User>>(`/api/twitter/me`, {
        withCredentials: true, // send cookies
      })
      .then((v) => {
        if (v.data) setData(v.data);
      })
      .catch(() => setError("Not Authenticated"))
      .finally(() => setLoading(false));
  }, []);

  return { error, data, loading };
}