export const getResourceMembersUrl = (resource: string) => {
  return getApiPath() + `query/login-by-machine/${resource}`;
};

export const getUserResourcesUrl = () => {
  return getApiPath() + `query/member-machines`;
};

export const getAddNewResourceUrl = () => {
  return getApiPath() + "gateway/resource";
};

export const getDisableResourceUrl = () => {
  return getApiPath() + "gateway/disable-resource";
};

export const getAddMemberUrl = () => {
  return getApiPath() + "gateway/resource";
};

const getApiPath = () => process.env.REACT_APP_REST_API_URL + "/api/";

export const getPostRequestConfig = (body: any, token: any) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(body)
  };
};

export const getDeleteRequestConfig = (body: any, token: any) => {
  return {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(body)
  };
};

export const getGetRequestConfig = (accessToken: string) => {
  return {
    method: "GET",
    headers: { Authorization: "Bearer " + accessToken }
  };
};

export const getExchangeToken = (subjectToken: string) => {
  if (!subjectToken) {
    console.error('subjectToken is null or undefined');
    return;
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    requested_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
    subject_token: subjectToken,
    subject_issuer: "https://auth.cern.ch/auth/realms/cern",
    client_id: "frontend-ui",
    audience: "backend"
  });
  
  const tokencina = fetch(
    "https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: body
    }
  )
    .then((data) => {
      if (!data.ok) {
        throw new Error(`Network response was not ok. Status: ${data.status}`);
      }
      return data.json();
    })
    .then((data) => {
      return data.access_token;
    })
    .catch((err) => {
      console.error('Error occurred while fetching exchange token:', err);
      throw err;
    });
  return tokencina;
};

