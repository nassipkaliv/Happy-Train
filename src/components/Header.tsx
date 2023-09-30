import React from "react";
import {useMoralis} from "react-moralis";
import {useRecoilState, useRecoilValue} from "recoil";
import {
  loggedInAccountAtom,
  userBalanceAtom,
  userIdSelector,
  viewAccountAddressAtom,
  viewUserIdSelector
} from "@stores/account";
import {roundUp} from "@helpers/numbers";
import UserSearch from "@components/UserSearch";
import {useTranslation} from "react-i18next";

export default function Header() {
  const {t} = useTranslation();
  const { isAuthenticating, logout } = useMoralis();
  const [currentUserAddress, setLoggedInAccount] = useRecoilState(loggedInAccountAtom);
  const [userAddress, setUserAddress] = useRecoilState(viewAccountAddressAtom);
  const viewUserId = useRecoilValue(viewUserIdSelector);
  const userId = useRecoilValue(userIdSelector);
  const balance = useRecoilValue(userBalanceAtom);

  const toggleNav = () => {
    const sidebar = document.getElementById('sidebar');
    const pageWrapper = document.getElementById('page-wrapper');
    sidebar?.classList.toggle('is-open');
    pageWrapper?.classList.toggle('is-open');
  };

  const logOut = () => {
    setLoggedInAccount(null);
    logout();
  }

  return (
    <nav className="navbar navbar-light bg-pink" id="header">
      <div className="container">
        <button
          onClick={toggleNav}
          className="navbar-toggler d-block d-lg-none"
        >
          <span className="navbar-toggler-icon"/>
        </button>

        <UserSearch/>

        {userAddress !== currentUserAddress && (
          <button
            className="btn btn-sm btn-primary tx-10 tx-lg-12"
            onClick={() => setUserAddress(currentUserAddress)}
          >
            {t('common.back-to-account')}
          </button>
        )}

        {userId !== viewUserId && (
          <div className="ms-2 me-auto d-none d-lg-inline-block">
            <div className="badge rounded-pill bg-primary me-2">
              {t('common.user-id')}: {viewUserId}
            </div>
          </div>
        )}

        <div className="ms-auto d-none d-lg-inline-block">
          <div className="badge rounded-pill bg-primary me-2">
            {t('common.balance')}: {roundUp(balance, 4)} BNB
          </div>
        </div>

        <button className="btn btn-sm btn-outline-light d-none d-lg-inline-block" onClick={logOut} disabled={isAuthenticating}>
          {t('common.sign-out')}
        </button>
      </div>
    </nav>
  )
}
