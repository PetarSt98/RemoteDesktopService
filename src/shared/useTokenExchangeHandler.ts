import { useEffect } from "react";
import { getExchangeToken } from "./navigator";

export const useTokenExchangeHandler = (
  token: string,
  callback: (accToken: string) => void
) => {
  console.log('exchangeToken:', token);
  useEffect(() => {
    const getToken = async () => {
      if (token !== undefined && token.length > 0) {
        const accessToken = await getExchangeToken(token);
        return accessToken;
      }
      return "";
    };

    getToken().then((data) => callback(data));
  }, [token, callback]);
};

