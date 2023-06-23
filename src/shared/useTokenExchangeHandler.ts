import { useEffect } from "react";
import { getExchangeToken } from "./navigator";

export const useTokenExchangeHandler = (
  token: string,
  callback: (accToken: string) => void
) => {
  console.log('exchangeToken:', token);
  useEffect(() => {
    const getToken = async () => {
      console.log('accessTokenUlazi:', Object.keys(token).length !== 0);
      if (token !== undefined && Object.keys(token).length !== 0) {
        console.log('accessToken:', 'Proso');
        const accessToken = await getExchangeToken(token);
        console.log('accessToken:', accessToken);
        return accessToken;
      }
      console.log('accessToken:', 'Fail');
      return "";
    };

    getToken().then((data) => callback(data));
  }, [token, callback]);
};

