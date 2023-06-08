// App.tsx
import React, { useState } from 'react';
import Keycloak from 'keycloak-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSearch from './Components/UserSearch';
import DeviceList from './Components/DeviceList';
import CreateUser from './Components/CreateUser';

const initOptions = {
  url: 'https://auth.cern.ch/auth',
  realm: 'cern',
  clientId: 'rds-frontend',
  redirectUri: 'http://localhost:3000/',
  clientSecret: 'FhYM5h0REVw474hGQto7v9Zud4JVLbfo',
};

let keycloak = Keycloak(initOptions);

const App: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState('');

  const login = () => {
    keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
      if (authenticated) {
        setAuth(true);
        setUsername(keycloak.tokenParsed?.preferred_username || '');
      } else {
        setAuth(false);
      }
    });
  }

  return (
    <div className="container py-5" style={{ background: '#f5f8fa' }}>
      <div className="py-3 mb-2" style={{ background: 'black', color: 'white' }}>
        <div style={{ float: 'right' }}>
          {!auth && (
            <button onClick={login} className="btn btn-primary mr-2">Login</button>
          )}
          {auth && (
            <>
              <span className="mr-2">Hello, {username}</span>
              <button onClick={() => keycloak.logout()} className="btn btn-secondary">Logout</button>
            </>
          )}
        </div>
      </div>
      <h1 className="text-center mb-5 text-primary">User Device Management</h1>
      <div className="row">
        <div className="col-md-6">
          <UserSearch />
        </div>
        <div className="col-md-6">
          <CreateUser />
        </div>
      </div>
    </div>
  );
}

export default App;
