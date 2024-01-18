import React, { useState, useEffect } from 'react';
import AuthRibbon from './AuthRibbon';
import Footer from './Footer';
import '../App.css';

const LogUserOff = ({ token, userName, primaryAccount }) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch(`https://terminalservicesws.web.cern.ch/TerminalServicesWS/TerminalServicesAdminWS.asmx/getTSTableWithLoginInfoForUser?username=${userName}&fetchOnlyPublicCluster=true`)
      .then(response => response.json())
      .then(data => setDevices(data))
      .catch(error => console.error('Error fetching devices:', error));
  }, [userName]);

  const handleLogOff = (serverName) => {
    fetch(`https://terminalservicesws.web.cern.ch/TerminalServicesWS/TerminalServicesAdminWS.asmx/logMeOff?userLogin=${userName}&serverName=${serverName}`)
      .then(response => {
        if (response.ok) {
          // Update the devices list or give feedback to the user
        }
      })
      .catch(error => console.error('Error logging off:', error));
  };

  return (
    <div className="App">
      {/* <AuthRibbon 
        authenticated={authenticated} 
        userToken={userToken} 
        kcInstance={kcInstance} 
        onAccountTypeChange={setAccountType}
      /> */}
      <div className="headerImage">
        <h1 className="headerTitle">CERN Remote Desktop Service</h1>
      </div>
      <div className="container mt-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Device</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index}>
                <td>{device.name}</td>
                <td>
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={() => handleLogOff(device.serverName)}
                  >
                    Log Off
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default LogUserOff;