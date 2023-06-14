// components/UserSearch.tsx
import React, { useState } from 'react';
import DeviceList from './DeviceList';

interface UserSearchProps {
  token: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);

  const handleSearch = () => {
    fetch(`https://rds-back-new-rds-frontend.app.cern.ch/api/UserSearcher/Search?userName=${userName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
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
