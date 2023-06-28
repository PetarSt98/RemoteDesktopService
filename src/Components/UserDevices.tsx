import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser'; // Import the CreateUser component
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";

interface UserDevicesProps {
  token: string;
  userName: string;
}

const UserDevices: React.FC<UserDevicesProps> = ({ token, userName }) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false); // New state to track whether to show the CreateUser form
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    // Check if exchangeToken is null before sending the request
    if (exchangeToken.length > 0) {
      fetch(`https://localhost:44354/api/UserDevices/search?userName=${userName}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + exchangeToken
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
    }
  }, [userName, exchangeToken]); // Fetch devices whenever userName or exchangeToken changes

  return (
    <div className="card p-3 h-100"> {/* Added h-100 for full height */}
      <div className="d-flex justify-content-between align-items-center mb-3"> {/* Used Bootstrap classes */}
        <h2>User's devices</h2>
        <button 
          onClick={() => setShowCreateUser(!showCreateUser)}
          className="btn btn-outline-primary"
        >
          ➕ Add new device
        </button>
      </div>
      {/* Conditionally render the CreateUser form */}
      {showCreateUser && (
        <CreateUser token={token} userName={userName} />
      )}
      {devices.length === 0 ? (
        <p>No devices found for the user.</p>
      ) : (
        <ul>
          {devices.map((device, index) => (
            <li key={index}>{device}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserDevices;
