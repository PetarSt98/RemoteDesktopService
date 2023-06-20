import React, { useState } from 'react';

interface CreateUserProps {
  token: string;
}

const CreateUser: React.FC<CreateUserProps> = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [deviceName, setDeviceName] = useState(''); 
  const [message, setMessage] = useState(''); // State variable for the response message
  const [messageType, setMessageType] = useState(''); // State variable for the message type

  const handleCreate = async () => {
    try {
      const response = await fetch('https://rds-back-new-rds-frontend.app.cern.ch/api/User/Add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userName, deviceName }), 
        credentials: 'include',
      });
  
      const text = await response.text();
  
      if (text === 'Successful user update') {
        setMessageType('success');
      } else {
        setMessageType('danger');
      }
  
      setMessage(text);
  
    } catch (error) {
      setMessageType('danger');
      setMessage('An error occurred while creating the user');
    } finally {
      setUserName('');
      setDeviceName('');
    }
  };

  return (
    <div className="card p-3">
      <h2 className="mb-3">Create User</h2>

      {/* Display the response message in an alert */}
      {message && (
        <div className={`alert alert-${messageType}`} role="alert">
          {message}
        </div>
      )}

      <div className="input-group">
        <input 
          type="text" 
          value={userName} 
          onChange={e => setUserName(e.target.value)} 
          className="form-control"
          placeholder="Create new user..."
        />
        <input 
          type="text" 
          value={deviceName} 
          onChange={e => setDeviceName(e.target.value)} 
          className="form-control"
          placeholder="Device name..."
        />
        <div className="input-group-append">
          <button onClick={handleCreate} className="btn btn-outline-primary">Create</button>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;