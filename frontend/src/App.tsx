// import React from 'react'; 
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       Hello World
//     </div>
//   );
// }

// App.tsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSearch from './Components/UserSearch';
import DeviceList from './Components/DeviceList';
import CreateUser from './Components/CreateUser';

const App: React.FC = () => {
  return (
    <div className="container py-5" style={{background: '#f5f8fa'}}>
      <h1 className="text-center mb-5 text-primary">User Device Management</h1>
      <div className="row">
        <div className="col-md-6">
          <UserSearch />
        </div>
        <div className="col-md-6">
          <CreateUser />
        </div>
      </div>
    </div>
  );
}

export default App;
