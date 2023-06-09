// components/UserSearch.tsx
import React, { useState } from 'react';
import DeviceList from './DeviceList';

const UserSearch: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
//
  const handleSearch = () => {
    fetch(`https://localhost:7164/api/UserSearcher/Search?userName=${userName}`)
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
