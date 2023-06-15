// Keycloak configs
export const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL;
export const keycloakRealm = process.env.REACT_APP_KEYCLOAK_REALM;
export const keycloakClientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;

export const refreshKeycloakToken =
  process.env.REACT_APP_KEYCLOAK_REFRESH_TOKEN === "true";

console.log("Setting environment as:");
console.log(process.env);
