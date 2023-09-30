import React from "react";
import btgLogo from "@assets/images/btg-logo.png";
import {Link, useLocation} from "react-router-dom";
// import yt from "@assets/images/yt.png";
import tg from "@assets/images/tg.png";
import tw from "@assets/images/tw.png";
import wechat from "@assets/images/wechat.png";
import Dashboard from "@pages/Dashboard";
import HappyTrainPage from "@components/pages/HappyTrainPage/HappyTrainPage";
import PromoPage from "@pages/PromoPage";
import SupportPage from "@pages/SupportPage";
import BonusPage from "@pages/BonusPage";
import {useMoralis} from "react-moralis";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {loggedInAccountAtom, userBalanceAtom} from "@stores/account";
import {roundUp} from "@helpers/numbers";
import confirmAlert from "@components/ConfirmAlert";
import QRCode from "qrcode.react";
import StatisticsPage from "@pages/StatisticsPage";
import {useTranslation} from "react-i18next";

export enum Page {
  DASHBOARD = 'dashboard',
  HAPPY_TRAIN = 'happy_train',
  BONUS = 'bonus',
  STATISTICS = 'statistics',
  PROMO = 'promo',
  SUPPORT = 'support',
}

export enum PagePath {
  DASHBOARD = '/',
  HAPPY_TRIAN = '/happy-train',
  BONUS = '/bonus',
  STATISTICS = '/statistics',
  PROMO = '/promo',
  SUPPORT = '/support',
}

interface NavPage {
  id: Page;
  path: PagePath;
  title: string;
  component: JSX.Element;
}

export const NavPages: Array<NavPage> = [
  {
    id: Page.DASHBOARD,
    path: PagePath.DASHBOARD,
    title: 'dashboard.title',
    component: <Dashboard/>,
  },
  {
    id: Page.HAPPY_TRAIN,
    path: PagePath.HAPPY_TRIAN,
    title: 'tower.my-tower',
    component: <HappyTrainPage/>,
  },
  {
    id: Page.BONUS,
    path: PagePath.BONUS,
    title: 'bonus.title',
    component: <BonusPage/>,
  },
  {
    id: Page.STATISTICS,
    path: PagePath.STATISTICS,
    title: 'statistics.title',
    component: <StatisticsPage/>,
  },
  {
    id: Page.PROMO,
    path: PagePath.PROMO,
    title: 'promo.title',
    component: <PromoPage/>,
  },
  {
    id: Page.SUPPORT,
    path: PagePath.SUPPORT,
    title: 'support.nav',
    component: <SupportPage/>,
  },
];

export default function Sidebar() {
  const {t} = useTranslation();
  const location = useLocation();
  const { isAuthenticating, logout } = useMoralis();
  const setLoggedInAccount = useSetRecoilState(loggedInAccountAtom);
  const balance = useRecoilValue(userBalanceAtom);
  const weChatLink = 'https://weixin.qq.com/g/AwYAAEEl8W-llCrmxKbLRNjT01bqxw0sRg1nvsX9BlGXgYaULVG8OSPNqt9PibU3';

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
    <div id="sidebar">
      <div className="logo tx-center mt-3">
        <Link to="/">
          <img src={btgLogo} title="Happy Train" alt="Happy Trian"/>
        </Link>
      </div>

      <nav id="sidebar-nav">
        {NavPages.map((nav) => {
          const isActive = location.pathname === nav.path;

          return (
            <Link
              className={`btn btn-primary ${isActive ? 'active' : ''}`}
              to={nav.path}
              key={nav.id}
              onClick={toggleNav}
            >
              {t(nav.title)}
            </Link>
          )
        })}
      </nav>

      <div className="d-flex flex-column align-items-center justify-content-center d-lg-none">
        <div className="d-flex mb-3 mx-auto">
          <div className="badge rounded-pill bg-primary me-2">
            {t('common.balance')}: {roundUp(balance, 4)} BNB
          </div>
        </div>

        <button className="btn btn-sm btn-outline-light mx-auto mb-3" onClick={() => {
          toggleNav();
          logOut();
        }} disabled={isAuthenticating}>
          {t('common.sign-out')}
        </button>
      </div>

      <div id="sidebar-socials">
        <span id="bg-lines"/>

        <div className="socials-list d-flex justify-content-around">
          <div
            onClick={() => {
              confirmAlert({
                title: 'WeChat QR code',
                confirmation: (
                  <div className="tx-center">
                    <QRCode value={weChatLink} size={175}/>
                  </div>
                ),
                noOk: true,
                cancelVariant: 'secondary',
                cancelLabel: t('common.close'),
              });
            }}
            className="cur-pointer"
          >
            <img src={wechat} alt="WeChat"/>
          </div>
          {/*<Link to="/">*/}
          {/*  <img src={yt} alt="YouTube"/>*/}
          {/*</Link>*/}
          <a href="https://t.me/happy_train_game" target="_blank" rel="noreferrer">
            <img src={tg} alt="Telegram"/>
          </a>
          <a href="https://twitter.com/HappyTrain_Game" target="_blank" rel="noreferrer">
            <img src={tw} alt="Twitter"/>
          </a>
        </div>

        <div>ver 1.0</div>
      </div>
    </div>
  )
}
