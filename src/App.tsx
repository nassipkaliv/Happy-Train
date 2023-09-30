import React, {useEffect, useState} from "react";
import {Routes, Route} from "react-router-dom";
import {useMoralis} from "react-moralis";
import Home from "./components/pages/Home";
import AccountPage from "./components/pages/AccountPage";
import {useRecoilState} from "recoil";
import AccountStore, {loggedInAccountAtom} from "@stores/account";
import Preloader from "@components/Preloader";
import {Toaster} from "react-hot-toast";
import {BTGIsRegisteredUser} from "@contracts/BuildTowerGame";
import MainPage from "@components/pages/MainPage/MainPage";

function App() {
  const { isWeb3Enabled, enableWeb3, isWeb3EnableLoading, isInitialized, isAuthenticated, account, logout } = useMoralis();
  const [isRegistered, setRegistered] = useState<boolean>();
  const [loggedInAccount, setLoggedInAccount] = useRecoilState(loggedInAccountAtom);

  const isLoggedIn = isAuthenticated && account && loggedInAccount && loggedInAccount === account;

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
      // @ts-ignore
      enableWeb3({ provider: connectorId, chainId: process.env.REACT_APP_CHAIN_ID });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    if (isAuthenticated && !loggedInAccount && account) {
      setLoggedInAccount(account);
    }
  }, [setLoggedInAccount, isAuthenticated, loggedInAccount, account]);

  useEffect(() => {
    if (isAuthenticated && loggedInAccount && account && loggedInAccount !== account) {
      logout();
      setLoggedInAccount(null);
    }
  }, [setLoggedInAccount, isAuthenticated, loggedInAccount, account]);

  useEffect(() => {
    if (isRegistered === undefined && account) {
      BTGIsRegisteredUser(account).then(setRegistered);
    }
  }, [account, isRegistered]);

  if(isInitialized) {
    return (
      <React.Suspense fallback={<Preloader/>}>
        <AccountStore/>
        <Routes>
          {!isLoggedIn && (<Route path="/:refId" element={<MainPage />}/>)}
          {!isLoggedIn && (<Route path="/" element={<MainPage />}/>)}
          {isLoggedIn && (
            <>
              <Route path="/:page" element={<AccountPage/>}/>
              <Route path="/" element={<AccountPage/>}/>
            </>
          )}
        </Routes>
        <Toaster/>
      </React.Suspense>
    )
  } else {
    return (<Preloader/>)
  }
}

export default App;
