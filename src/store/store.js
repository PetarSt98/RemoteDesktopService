import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from "redux";
import { keycloakReducer } from "@authzsvc/keycloak-js-react";
import { combineReducers } from "redux";
import { remoteAccessReducer } from "./reducers/remote-access";

const middleware = [thunk];

let composed;
if (window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined) {
  composed = compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__()
  );
} else {
  composed = applyMiddleware(...middleware);
}

const rootReducer = combineReducers({
  keycloak: keycloakReducer,
  remoteAccess: remoteAccessReducer
});
export const store = createStore(rootReducer, composed);
