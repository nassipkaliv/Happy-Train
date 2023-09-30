import {Level} from "@contracts/BuildTowerGame";
import React from "react";
import coin from "@assets/images/binance-coin-sm.png";
import {useRecoilValue} from "recoil";
import {loggedInAccountAtom, viewAccountAddressAtom} from "@stores/account";
import {globalStatisticsState} from "@stores/contract";
import {useTranslation} from "react-i18next";

interface HappyTrainBoardProps {
  currentLevelIndex: number;
  currentLevel: Level | null;
  price: string;
  onBuy: () => void;
  queuePlace: number;
}

interface CurrentLevelViewProps {
  currentLevel: Level;
  isCurrentUser: boolean;
  isBroken: boolean;
  onBuy: () => void;
  queuePlace: number;
}

const CurrentLevelView = ({onBuy, queuePlace, currentLevel, isCurrentUser, isBroken}: CurrentLevelViewProps) => {
  const {t} = useTranslation();

  return (
    <>
      {!currentLevel.maxPayouts && currentLevel.canBuild && (
        <div className="card-body">
          <div className="mt-2 mt-lg-5 mb-2 mb-lg-5">{t('tower.available-for-building')}</div>
          {isCurrentUser && (<button className="btn btn-pink mt-3 mb-1 mb-lg-3" onClick={onBuy}>{t('tower.build')}</button>)}
        </div>
      )}
      {!currentLevel.maxPayouts && !currentLevel.canBuild && (
        <div className="card-body">
          <div className="mt-2 mt-lg-5 mb-2 badge bg-danger px-2">{t('tower.not-available')}</div>
          <div className="mb-2 mb-lg-5 tx-20">{t('tower.not-available-alert')}</div>
        </div>
      )}

      {!!currentLevel.maxPayouts && (
        <div className="card-body">
          <div className="activation-times">{currentLevel.activationTimes}</div>
          <div className="rent-payments">
            <span>{t('tower.rent-payments')}</span>
            {currentLevel.curPayouts} {t('common.of')} {currentLevel.maxPayouts}
          </div>

          {!isBroken && (
            <div className="rent-progress">
              <span
                style={{
                  backgroundPosition: `${(100 - queuePlace) / 100 * 285}px 0`,
                  marginLeft: `${(100 - queuePlace) / 100 * -285}px`
                }}
                className="desktop progress-bg"
              />
              <span
                style={{
                  width: `calc(${queuePlace}% - 10px)`,
                }}
                className="mobile progress-bg"
              />
              <span className="desktop progress-value">{queuePlace.toFixed(2)}%</span>
            </div>
          )}

          {isBroken && (
            <div className="tx-pink tx-24 tx-uppercase">
              {t('tower.emergency-state')}
            </div>
          )}

          <div className="d-lg-flex justify-content-between tx-12">
            <div className="tx-lg-left mb-2 mb-lg-0">
              <div>{t('tower.partner-bonus')}</div>
              <div className="bg-white tx-orange px-1 tx-14">{currentLevel.referralPayoutSum} BNB</div>
            </div>
            <div className="tx-lg-right">
              <div>{t('tower.floor-profits')}</div>
              <div className="bg-white tx-success px-1 tx-14">{currentLevel.rewardSum} BNB</div>
            </div>
          </div>

          {isCurrentUser && (
            <button className="btn btn-pink mt-3 mb-3" onClick={onBuy} disabled={!currentLevel.canUpgrade}>
              {currentLevel.curPayouts >= currentLevel.maxPayouts && currentLevel.canUpgrade ? t('tower.renovate') : t('tower.strengthen')}
            </button>
          )}
        </div>
      )}
    </>
  )
};

export default function HappyTrainBoard({currentLevel, currentLevelIndex = 0, price, onBuy, queuePlace}: HappyTrainBoardProps) {
  const {t} = useTranslation();
  const globalStatistics = useRecoilValue(globalStatisticsState);
  const currentUserAddress = useRecoilValue(loggedInAccountAtom);
  const userAddress = useRecoilValue(viewAccountAddressAtom);
  const isCurrentUser = currentUserAddress === userAddress;
  const isBroken = currentLevel
    ? currentLevel.curPayouts >= currentLevel.maxPayouts
    : false;
  const minMembers = [25000,50000,100000];
  const minWaitIndex = 17;
  const waitGlobalStats = globalStatistics
    && currentLevelIndex >= minWaitIndex
    && globalStatistics.members < minMembers[currentLevelIndex - minWaitIndex];

  return (
    <div className="card card--tower">
      <div className="card-header">
        <span>{t('common.floor')} {currentLevelIndex + 1}</span>
        <span className="level-price"><img src={coin} alt="BNB" /> {price}</span>
      </div>
      {currentLevelIndex >= minWaitIndex && (
        <>
          {(!globalStatistics || !currentLevel) && (<div className="tx-24 wd-100p tx-center">{t('common.loading')}...</div>)}
          {globalStatistics && !waitGlobalStats && currentLevel && (
            <CurrentLevelView
              currentLevel={currentLevel}
              isCurrentUser={isCurrentUser}
              isBroken={isBroken}
              onBuy={onBuy}
              queuePlace={queuePlace}
            />
          )}
          {globalStatistics && waitGlobalStats && currentLevel && (
            <div className="card-body">
              <div className="mt-2 mt-lg-4 mb-2 badge bg-success px-2">{t('tower.available-in')}</div>
              <div className="rent-payments mb-2 mb-lg-5">
                <span>{t('statistics.total-users')}</span>
                {globalStatistics.members} {t('common.of')} {minMembers[currentLevelIndex - minWaitIndex]}
              </div>
            </div>
          )}
        </>
      )}
      {currentLevel && currentLevelIndex < minWaitIndex && (
        <CurrentLevelView
          currentLevel={currentLevel}
          isCurrentUser={isCurrentUser}
          isBroken={isBroken}
          onBuy={onBuy}
          queuePlace={queuePlace}
        />
      )}
      <div className="card-footer"/>
    </div>
  )
}
