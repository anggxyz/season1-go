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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter()

  useEffect(() => {
    setLoading(true);
    axios
      .get<unknown, AxiosResponse<UserPayload>>(`/api/twitter/me`, {
        withCredentials: true, // send cookies
      })
      .then((v) => {
        if (v.data) setData(v.data);
        setIsConnected(!!v.data.payload);
      })
      .catch(() => setError("Not Authenticated"))
      .finally(() => setLoading(false));
  }, []);

  const disconnect = () => {
    try {
      // something about this feels so wrong
      // i'm too sleep deprived to fix this
      router.push('/api/twitter/signout');
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  return { error, data, loading, disconnect, isConnected };
}