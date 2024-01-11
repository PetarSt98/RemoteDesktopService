import React, { useState } from 'react';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';

interface CreateUserProps {
  token: string;
  userName: string;
  editUser: (deviceName: string) => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ token, userName, editUser}) => {
  const [deviceName, setDeviceName] = useState(''); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading status
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);
  var signedInUser = userName
  const handleCreate = async () => {
    setIsLoading(true);
    console.log(`Creating user: ${userName} with device: ${deviceName}`);
    try {
      const response = await fetch('https://rdgateway-backend-test.app.cern.ch/api/add_pop_up/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " +  exchangeToken
        },
        body: JSON.stringify({ userName, deviceName, PrimaryUser:signedInUser, SignedInUser: signedInUser, addDeviceOrUser: 'device' }), 
      });

      const data = await response.text();
  
      if (data === 'Successfully added the device!') {
        console.log('Successfully added the device!');
        setMessageType('success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Failed to add device');
        setMessageType('danger');
      }
  
      setMessage(data);
  
    } catch (error) {
        setMessageType('danger');
        setMessage('An error occurred while creating the device');
    } finally {
        setIsLoading(false);
        setDeviceName(deviceName);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleCreate();
  };

  return (
    <>
      <Form onSubmit={handleFormSubmit}>
        <div className="input-group mb-3">
          <input 
            type="text" 
            value={deviceName} 
            onChange={e => setDeviceName(e.target.value)} 
            className="form-control"
            placeholder="Device name..."
            disabled={isLoading} // Input field is disabled while loading
          />
          <div className="input-group-append">
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={isLoading}
            title="Manage users for this device"
            onClick={() => editUser(deviceName)}
            style={{ marginLeft: '4px' }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
            <button type="submit" className="btn btn-outline-primary" disabled={isLoading} title="Add new device to user" style={{ marginLeft: '4px' }}>
              {isLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <>
                <FontAwesomeIcon icon={faPlus} /> Add
              </>
              )}
            </button>
          </div>
        </div>
      </Form>
      
      {/* Display the response message in an alert */}
      {message && (
        <div className={`alert alert-${messageType}`} role="alert">
          {message}
        </div>
      )}
    </>
  );
}

export default CreateUser;
