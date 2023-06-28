import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";

interface UserSearchProps {
  token: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);
// Ovde nesto ne valja sa komunikacijom
  const handleSearch = () => {
    fetch(`https://localhost:44354/api/DeviceSearcher/search?deviceName=${userName}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " +  exchangeToken
      }
    })
    .then(response => response.json())
    .then(data => {
        // Check if data is an array before setting state
        if (Array.isArray(data)) {
            setDevices(data);
        } else {
            console.error("Expected an array but got:", typeof data);
            setDevices([]);
        }
    })
    .catch(error => {
        console.error(error);
        setDevices([]);
    });
  };
  return (
    <div className="card p-3">
      <h2 className="mb-3">Search for the device</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={userName} 
          onChange={e => setUserName(e.target.value)} 
          className="form-control"
          placeholder="Search device..."
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
