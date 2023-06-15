export const keycloakAuthenticated = (state) => {
  return state.keycloak.authenticated;
};

export const keycloakUserToken = (state) => {
  return state.keycloak.userToken;
};

export const keycloakInstance = (state) => state.keycloak.instance;
