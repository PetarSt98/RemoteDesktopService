import { keycloakReducer as keycloak } from "@authzsvc/keycloak-js-react";
import { combineReducers } from "redux";

export default () =>
  combineReducers({
    keycloak,
  });
