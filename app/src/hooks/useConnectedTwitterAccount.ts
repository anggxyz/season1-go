import { useEffect, useState } from "react";
import axios, { type AxiosResponse } from "axios";
import { useRouter } from 'next/navigation'

export interface UserPayload {
  payload: {
    id: string;
    name: string;
    username: string;
  } | null;
  ok: boolean;
}

export function useConnectedTwitterAccount() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<UserPayload | null>(null);
  const router = useRouter()

  useEffect(() => {
    setLoading(true);
    axios
      .get<unknown, AxiosResponse<UserPayload>>(`/api/twitter/me`, {
        withCredentials: true, // send cookies
      })
      .then((v) => {
        if (v.data) setData(v.data);
      })
      .catch(() => setError("Not Authenticated"))
      .finally(() => setLoading(false));
  }, []);

  const disconnect = () => {
    try {
      router.push('/api/twitter/signout');
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  return { error, data, loading, disconnect };
}