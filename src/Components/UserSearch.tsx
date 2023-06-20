import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';

interface UserSearchProps {
  token: string;
}

const getAccessToken = async () => {
  const AUTH_SERVER = 'auth.cern.ch';
  const AUTH_REALM = 'cern';

  const response = await fetch(`https://${AUTH_SERVER}/auth/realms/${AUTH_REALM}/api-access/token`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: 'rds-back', // Replace with your client_id
          client_secret: 'QMItHzMlFWUSJL4HmdGhbsEj6GhA4H1T', // Replace with your client_secret
          audience: 'rds-front' // Replace with your audience
      })
  });

  if (response.ok) {
      const data = await response.json();
      return data.access_token;
  } else {
      throw new Error(`Failed to fetch access token: ${response.statusText}`);
  }
};

const UserSearch: React.FC<UserSearchProps> = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
  const [exchangeToken, setExchangeToken] = useState("");

  useEffect(() => {
    getAccessToken()
        .then((token) => {
            console.log("Access token: ", token);
            setExchangeToken(token);
        })
        .catch(console.error);
  }, []); 

  const handleSearch = () => {
    console.log('token', getAccessToken())
    fetch(`https://rds-back-new-rds-frontend.app.cern.ch/api/UserSearcher/Search?userName=${userName}`, {
      headers: {
        'Authorization': `Bearer ${exchangeToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setDevices(data);
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="card p-3">
      <h2 className="mb-3">Search User</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={userName} 
          onChange={e => setUserName(e.target.value)} 
          className="form-control"
          placeholder="Search user..."
        />
        <div className="input-group-append">
          <button onClick={handleSearch} className="btn btn-outline-primary">Search</button>
        </div>
      </div>
      <DeviceList devices={devices} />
    </div>
  );
}

export default UserSearch;
