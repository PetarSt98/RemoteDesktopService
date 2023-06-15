import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import store from "./store";
import * as cfg from "./config";
import { Provider } from "react-redux";
import KeycloakWrapper from "@authzsvc/keycloak-js-react";
import Keycloak from "keycloak-js";

console.log("Config vars: ");
console.log(cfg);

ReactDOM.render(
  <Provider store={store}>
    <KeycloakWrapper
      keycloak={
        new Keycloak({
          url: cfg.keycloakUrl,
          realm: cfg.keycloakRealm,
          clientId: cfg.keycloakClientId,
        })
      }
      refresh={cfg.refreshKeycloakToken}
      keycloakParams={{
        onLoad: "login-required",
        promiseType: "native",
        flow: "standard",
      }}
    >
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </KeycloakWrapper>
  </Provider>,
  document.getElementById("root")
);
