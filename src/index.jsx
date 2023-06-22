import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Keycloak from "keycloak-js";
import KeycloakWrapper from "@authzsvc/keycloak-js-react";
import * as cfg from "./keycloakConfig";

ReactDOM.render(
  <Provider store={store}>
    <KeycloakWrapper
      keycloak={
        new Keycloak({
          url: cfg.keycloakUrl,
          realm: cfg.keycloakRealm,
          clientId: cfg.keycloakClientId
        })
      }
      refresh={cfg.refreshKeycloakToken}
      keycloakParams={{
        onLoad: "login-required",
        promiseType: "native",
        flow: "standard",
        checkLoginIframe: false
      }}
    >
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </KeycloakWrapper>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
