/* globals process */

// Polyfills for the browser environment
import 'babel-polyfill';
import 'whatwg-fetch';

import './normalize.css';
import './global.css';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import {Iterable} from 'immutable';

import rootReducer from './reducers/rootReducer';
import App from './containers/app/app';

const middlewares = [thunk];

// We only want to add Redux logger middleware in a dev environment
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(createLogger({
    collapsed: true,
    stateTransformer: state => (
      Iterable.isIterable(state) ? state.toJS() : state
    ),
  }));
}

let storeEnhancer = applyMiddleware(...middlewares);

// If we're in dev mode we add a hook for the Redux Chrome tools
if (process.env.NODE_ENV !== 'production') {
  storeEnhancer = compose(
    storeEnhancer,
    window.devToolsExtension ? window.devToolsExtension() : f => f
  );
}

const store = createStore(rootReducer, storeEnhancer);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
