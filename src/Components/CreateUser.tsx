import React, { useState } from 'react';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";

interface CreateUserProps {
  token: string;
  userName: string;
}

const CreateUser: React.FC<CreateUserProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState(''); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  const handleCreate = async () => {
    console.log(`Creating user: ${userName} with device: ${deviceName}`);
    try {
      const response = await fetch('https://localhost:44354/api/User/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " +  exchangeToken
        },
        body: JSON.stringify({ userName, deviceName }), 
      });
  
      const data = await response.text();
  
      if (data === 'Successful user update') {
        console.log('User created successfully');
        setMessageType('success');
      } else {
        console.error('Failed to add user');
        setMessageType('danger');
      }

  
      setMessage(data);
  
    } catch (error) {
      setMessageType('danger');
      setMessage('An error occurred while creating the user');
    } finally {
      setDeviceName('');
    }
  };

  return (
    <div className="card p-3">
      <h2 className="mb-3">Add user to the device</h2>

      {/* Display the response message in an alert */}
      {message && (
        <div className={`alert alert-${messageType}`} role="alert">
          {message}
        </div>
      )}

      <div className="input-group">
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
