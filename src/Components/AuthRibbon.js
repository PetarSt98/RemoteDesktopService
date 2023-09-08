import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import '../App.css';

const AuthRibbon = ({ authenticated, userToken, kcInstance, onAccountTypeChange  }) => {
  const logout = () => {
    kcInstance.logout();
  };

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const getData = async () => {
      const userInfoResponse = await fetch(
        `${userToken.iss}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${kcInstance.token}` },
        }
      );
      const fetchedUserInfo = await userInfoResponse.json();
      setUserInfo(fetchedUserInfo);
      onAccountTypeChange(fetchedUserInfo.account_type);
    };
    getData();
  }, [userToken, kcInstance.token]);

  return (
    <header id="cern-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="cern-title" style={{ display: 'flex', alignItems: 'center' }}>
        <h1>
          <a href="http://cern.ch" title="CERN">
            <span className="cern-word">CERN</span>
            <span className="accelerating-science">Accelerating science</span>
          </a>
        </h1>
      </div>
      <ul className="cern-signedin" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
        <li className="cern-accountlinks" style={{ display: 'flex', alignItems: 'center' }}>
          <span>Signed in as: 
            <a className="account" href="http://cern.ch/account" title={`Signed as (${userInfo.preferred_username})`}>{userInfo.preferred_username}</a>
          </span> 
          <a className="cern-signout" onClick={logout} title="Sign out of your account">Sign out</a>
        </li>
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <a className="cern-directory" href="http://cern.ch/directory" title="Search CERN resources and browse the directory">Directory</a>
        </li>
      </ul>
    </header>
  );
  

}

AuthRibbon.propTypes = {
  authenticated: PropTypes.bool,
  userToken: PropTypes.object,
  kcInstance: PropTypes.object
};

export default AuthRibbon;
