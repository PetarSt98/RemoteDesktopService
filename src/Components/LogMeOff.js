import React, { useState, useEffect } from 'react';
import AuthRibbon from './AuthRibbon';
import Footer from './Footer';
import '../App.css';

const LogMeOff = ({ token, userName, primaryAccount }) => {
  const [devices, setDevices] = useState([]);

  // useEffect(() => {
  //   const headers = new Headers();
  //   headers.append('Authorization', 'Basic ' + btoa("svctsadm:Kan1b0l@CERN2010"));

  //   fetch(`/TerminalServicesWS/TerminalServicesAdminWS.asmx/getTSTableWithLoginInfoForUser?username=${userName}&fecthOnlyPublicCluster=true`, { 
  //     method: 'GET',
  //     headers: headers 
  //   })
  //   .then(response => {
  //     if(response.ok) {
  //       console.log(response);
  //       console.log(response.json())
  //       return response.json();
  //     }
  //     throw new Error('Network response was not ok.');
  //   })
  //   .then(data => {
  //     console.log(data);
  //     setDevices(data);
  //   })
  //   .catch(error => {
  //     console.error('Error fetching devices:', error)
  //   });
  // }, [userName]); 
  useEffect(() => {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa("svctsadm:Kan1b0l@CERN2010"));
  
    fetch(`/TerminalServicesWS/TerminalServicesAdminWS.asmx/getTSTableWithLoginInfoForUser?username=${userName}&fecthOnlyPublicCluster=true`, {
      method: 'GET',
      headers: headers 
    })
    .then(response => {
      if(response.ok) {
        return response.text(); // Ensure this is the only time you read the response body
      }
      throw new Error('Network response was not ok.');
    })
    .then(str => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, "application/xml");
      console.log(str);
      console.log(xml);
      const clusterNames = Array.from(xml.getElementsByTagName("ClusterName")).map(node => node.textContent);
      // Assuming you want to set devices to an array of cluster names
      const devices = clusterNames.map(name => ({ name: name }));
      setDevices(devices); 
    })
    .catch(error => {
      console.error('Error fetching devices:', error);
    });
  }, [userName]);
  


  const handleLogOff = (serverName) => {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa("svctsadm:Kan1b0l@CERN2010"));

    fetch(`https://terminalservicesws.web.cern.ch/TerminalServicesWS/TerminalServicesAdminWS.asmx/logMeOff?userLogin=${userName}&serverName=${serverName}`, { method: 'GET', headers: headers })
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

export default LogMeOff;
