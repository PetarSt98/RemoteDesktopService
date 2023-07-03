import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import Swal from 'sweetalert2';
import { Form, Collapse, Button } from 'react-bootstrap';

interface UserSearchProps {
  token: string;
  userName: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState('');
  const [searchedDeviceName, setSearchedDeviceName] = useState("");
  const [devices, setDevices] = useState<string[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchSuccessful, setSearchSuccessful] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  const handleSearch = () => {
    setSearchClicked(true);
    setShowAddUser(false);
    const uppercasedDeviceName = deviceName.toUpperCase();
    fetch(`https://localhost:44354/api/search_tabel/search?userName=${userName}&deviceName=${uppercasedDeviceName}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " +  exchangeToken
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.text().then(text => {
            throw new Error(text);
          });
        }
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDevices(data);
          setSearchSuccessful(true);
          setSearchedDeviceName(deviceName);
        } else {
          console.error("Expected an array but got:", typeof data);
          setDevices([]);
          setSearchSuccessful(false);
        }
      })
      .catch(error => {
        console.error(error);
        if (error.message.includes("owner")) {
          Swal.fire({
            title: 'Unauthorized device!',
            text: error.message,
            icon: 'error'
          });
        } else {
          Swal.fire({
            title: 'Warning!',
            text: error.message,
            icon: 'info'
          });
        }
        setDevices([]);
        setSearchSuccessful(false);
      });
      
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to remove this device from the user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const uppercasedDeviceName = searchedDeviceName.toUpperCase();
        fetch(`https://localhost:44354/api/devices_tabel/remove?userName=${userName}&deviceName=${uppercasedDeviceName}&fetchToDeleteResource=${false}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + exchangeToken
          }
        })
          .then(response => response.text())
          .then(data => {
            let color: 'success' | 'error';
            if (data === "Successful user removal!") {
              color = 'success';
              Swal.fire({
                text: data,
                icon: color
              }).then(() => {
                window.location.reload();
              });
            } else {
              color = 'error';
              Swal.fire({
                text: data,
                icon: color
              });
            }
          })
          .catch(error => {
            console.error(error);
            Swal.fire({
              text: "Failed to delete device",
              icon: 'error'
            });
          });
      }
    });
  };
  // const handleFormSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   handleSearch();
  // };
  const handleAddUser = () => {
    setShowAddUser(true);
  };
  const handleNewUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('https://localhost:44354/api/add_pop_up/add_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " +  exchangeToken
      },
      body: JSON.stringify({ userName: newUserName, deviceName: searchedDeviceName.toUpperCase() }),
    });
    const result = await response.text();
    let color: 'success' | 'error' = response.ok ? 'success' : 'error';
    Swal.fire({
      text: result,
      icon: color
    });
    if(response.ok) {
      setNewUserName('');
      setShowAddUser(false);
      // If successful, fetch the updated user list
      handleSearch();
    }
  };
//   return (
//     <div className="card p-3 h-100">
//       <h2 className="mb-3">Search for the device</h2>
//       <Form onSubmit={handleFormSubmit}>
//         <div className="input-group">
//           <input 
//             type="text" 
//             value={deviceName} 
//             onChange={e => setDeviceName(e.target.value)} 
//             className="form-control"
//             placeholder="Search device..."
//           />
//           <div className="input-group-append">
//             <button 
//               type="button" 
//               onClick={handleSearch} 
//               className="btn btn-outline-primary"
//               title="Search device"
//             >
//               Search
//             </button>
//             {searchSuccessful && (
//               <div className="d-flex ml-2">
//                 <DownloadRdp computerName={searchedDeviceName.toUpperCase()} />
//                 <button 
//                   onClick={handleDelete} 
//                   className="btn btn-outline-danger ml-2"
//                   disabled={!searchSuccessful}
//                   title="Remove device from user"
//                 >
//                   Remove device
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </Form>
//       {searchClicked && <DeviceList devices={devices} />}
//     </div>
//   );
// }
return (
  <div className="card p-3 h-100">
    <h3 className="card-title">Search</h3>
    <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter device name..."
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <div className="input-group-append">
          <button 
            type="submit"
            className="btn btn-outline-primary"
            title="Search device"
          >  
            Search  
          </button>
        </div>
      </div>
    </Form>
    {searchSuccessful && (
      <div className="mb-3 d-flex justify-content-between">
        <DownloadRdp computerName={searchedDeviceName.toUpperCase()} />
        <Button 
          variant="outline-danger"
          onClick={handleDelete} 
          disabled={!searchSuccessful}
          title="Remove device from user"
        >
          Remove device  
        </Button>
        <Button 
          variant={showAddUser ? "outline-secondary" : "outline-primary"}
          onClick={() => setShowAddUser(!showAddUser)}
          aria-controls="example-collapse-text"
          aria-expanded={showAddUser}
        >
          {showAddUser ? "Hide Add New User" : "Add New User"}
        </Button>
      </div>
    )}
    {searchClicked && <DeviceList devices={devices} />}
    <Collapse in={showAddUser}>
      <div id="example-collapse-text">
        <Form onSubmit={handleNewUserSubmit}>
          <div className="input-group mb-3">
            <input
              type="text"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              className="form-control"
              placeholder="New user name..."
            />
            <div className="input-group-append">
              <Button variant="outline-primary" type="submit" title="Add user">Add User</Button>
            </div>
          </div>
        </Form>
      </div>
    </Collapse>
  </div>
);
};
export default UserSearch;
