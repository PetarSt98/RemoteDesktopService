import { createBrowserHistory } from "history";
import createRootReducer from "./reducers";
import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from "redux";

const middleware = [thunk];
const browserHistory = createBrowserHistory();

let composed;
if (window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined) {
  composed = compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__()
  );
} else {
  composed = applyMiddleware(...middleware);
}

export { browserHistory };

export default createStore(createRootReducer(), {}, composed);
