import { useEffect } from "react";
import { getExchangeToken } from "./navigator";

export const useTokenExchangeHandler = (
  token: string,
  callback: (accToken: string) => void
) => {
  useEffect(() => {
    const getToken = async () => {
      if (token !== undefined && Object.keys(token).length !== 0) {
        const tokencina = token;
        try {
          const accessToken = await getExchangeToken(tokencina);
          console.log('accessToken:', 'Successful');
          return accessToken;
        } catch (err) {
          console.error('Error occurred while getting exchange token:', err);
        }
      }
      console.log('accessToken:', 'Fail');
      return "";
    };

    getToken().then((data) => callback(data));
  }, [token, callback]);
};
