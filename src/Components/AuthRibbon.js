import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import '../App.css';

const AuthRibbon = ({ authenticated, userToken, kcInstance }) => {
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
      setUserInfo(await userInfoResponse.json());
    };
    getData();
  }, [userToken, kcInstance.token]);
  return (
    <div className="top-ribbon">
      <div className="user-info">
        <p className="user-name">{userInfo.name}</p>
        <p className="user-username">{userInfo.preferred_username}</p>
      </div>
      {authenticated && (
        <button className="logout-button" onClick={() => logout()}>Logout</button>
      )}
    </div>
  );
}

AuthRibbon.propTypes = {
  authenticated: PropTypes.bool,
  userToken: PropTypes.object,
  kcInstance: PropTypes.object
};

export default AuthRibbon;
