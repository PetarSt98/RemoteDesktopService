import React, { useState } from 'react';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { Spinner } from 'react-bootstrap';

interface CreateUserProps {
  token: string;
  userName: string;
}

const CreateUser: React.FC<CreateUserProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState(''); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading status
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  const handleCreate = async () => {
    setIsLoading(true);
    console.log(`Creating user: ${userName} with device: ${deviceName}`);
    try {
      const response = await fetch('https://localhost:44354/api/add_pop_up/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " +  exchangeToken
        },
        body: JSON.stringify({ userName, deviceName }), 
      });
  
      const data = await response.text();
  
      if (data === 'Successfully added the device!') {
        console.log('Successfully added the device!');
        setMessageType('success');
      } else {
        console.error('Failed to add device');
        setMessageType('danger');
      }
  
      setMessage(data);
  
    } catch (error) {
      setMessageType('danger');
      setMessage('An error occurred while creating the user');
    } finally {
      setIsLoading(false);
      setDeviceName('');
    }
  };

  return (
    <div className="card p-3">
      <h2 className="mb-3">Input a new device name</h2>

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
          disabled={isLoading} // Input field is disabled while loading
        />
        <div className="input-group-append">
          <button onClick={handleCreate} className="btn btn-outline-primary" disabled={isLoading}>
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;
