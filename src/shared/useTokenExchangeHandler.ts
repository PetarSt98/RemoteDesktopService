import { useEffect } from "react";
import { getExchangeToken } from "./navigator";

export const useTokenExchangeHandler = (
  token: string,
  callback: (accToken: string) => void
) => {
  useEffect(() => {
    const getToken = () => {
      if (token !== undefined && token.length > 0) {
        const accessToken = getExchangeToken(token);
        return accessToken;
      }
      return Promise.resolve("");
    };
    getToken().then((data) => callback(data));
  }, [token, callback]);
};
