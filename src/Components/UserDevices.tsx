import React, { useState, useEffect } from 'react';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";

interface UserDevicesProps {
  token: string;
  userName: string;
}

const UserDevices: React.FC<UserDevicesProps> = ({ token, userName }) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    fetch(`https://localhost:44354/api1/GetDevices/all?userName=${userName}`, {
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
  }, [userName, exchangeToken]); // Fetch devices whenever userName or exchangeToken changes

  return (
    <div className="card p-3">
      <h2 className="mb-3">User Devices</h2>
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
