import Header from "../Header";
import React, {useEffect, useState} from "react";
import {BTGIsRegisteredUser} from "@contracts/BuildTowerGame";
import {useMoralis} from "react-moralis";
import Preloader from "@components/Preloader";
import Register from "@pages/Register";
import {useRecoilState,useRecoilValue} from "recoil";
import {isClanSelected, isRegisteredAtom} from "@stores/account";
import Sidebar, {NavPages} from "@components/Sidebar";
import Footer from "@components/Footer";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import ClanSelection from "./ClanSelection";

export default function AccountPage() {
  const {t} = useTranslation();
  const { account } = useMoralis();
  const {page} = useParams();
  const [isRegisteredMoralis, setRegisteredMoralis] = useState<boolean>();
  const [isRegisteredState, setRegisteredState] = useRecoilState(isRegisteredAtom);
  const isClan = useRecoilValue(isClanSelected)
  const currentPage = NavPages.find((p) => p.path === `/${page || ''}`);

  useEffect(() => {
    if (isRegisteredMoralis === undefined && account) {
      BTGIsRegisteredUser(account).then(setRegisteredMoralis);
    } else if (!isRegisteredState && isRegisteredMoralis) {
      setRegisteredState(true);
    }
  }, [account, isRegisteredMoralis, isRegisteredState, setRegisteredState]);

  return (
    <div className="page-wrapper">
      {isRegisteredState && (
        <Sidebar/>
      )}
      <div className="page" id={currentPage?.id || 'not-found'}>
        <Header/>
        {isRegisteredMoralis === undefined && <Preloader iconClass="tx-48"/>}
          {isRegisteredMoralis === false && !isClan && <ClanSelection/>}
        {isRegisteredMoralis === false && !isRegisteredState && isClan && (<Register/>)}
        {(isRegisteredMoralis === true || isRegisteredState) && (
          <div id="page-content">
            {currentPage?.component}
            {!currentPage && (
              <div className="p-2 text-uppercase">
                <h1>{t('error.not-found')}</h1>
              </div>
            )}
          </div>
        )}
        <Footer/>
      </div>
    </div>
  );
}
