import React, {useEffect, useState, useTransition} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {loggedInAccountAtom, viewAccountAddressAtom} from "@stores/account";
import Preloader from "@components/Preloader";
import {BTGGetUser, UserInfo} from "@contracts/BuildTowerGame";
import avatar from "@assets/images/user-ava.png";
import {getEllipsisTxt, tokenValue} from "@helpers/formatters";
import format from "date-fns/format";
import {convertStringToNumber, multiply} from "@helpers/bignumber";
import CopyButton from "@components/CopyButton";
import QueryTableOld from "@components/QueryTable";
import {useTranslation} from "react-i18next";

export default function Dashboard() {
  const {t} = useTranslation();
  const [isPending] = useTransition();
  const currentUserAddress = useRecoilValue(loggedInAccountAtom);
  const [userAddress, setUserAddress] = useRecoilState(viewAccountAddressAtom);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isUserLoading, setUserLoading] = useState<boolean>(false);

  const referralLink = `${window.location.origin}/${user?.id}`;

  const loadUser = () => {
    // console.log({currentUserAddress, userAddress});
    if (!userAddress) {
      return;
    }

    setUserLoading(true);

    try {
      BTGGetUser(userAddress)
        .then((result) => {
          setUser(result);
          setUserLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setUserLoading(false);
          setUser(null);
        });
    } catch (e) {
      console.error(e);
      setUserLoading(false);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userAddress]);

  return (
    <React.Suspense fallback={<Preloader/>}>
      <div className="container-fluid py-2">
        <div className="d-md-flex align-items-center mb-2">
          <h1 className="mb-md-0">{t('dashboard.title')}</h1>
        </div>

        {user && (
          <>
            <div className="row">
              <div className="col-md-3 tx-center mb-3">
                <div className="card card--user">
                  <div className="card-avatar">
                    <img src={avatar} title={`ID ${user.id}`} alt={`ID ${user.id}`} />
                  </div>
                  <div className="card-body">
                    <div>
                      {t('common.id')} {user.id}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div>
                      {getEllipsisTxt(userAddress || '', 6)}
                    </div>
                    <CopyButton text={userAddress || ''} element={t('common.copy')} className="btn btn-sm btn-pink mt-1" noIcon/>
                  </div>
                </div>
                <div className="tx-10">
                  {t('common.invited')} {format(new Date(convertStringToNumber(multiply(user.registrationTimestamp, 1000))), 'dd.MM.yyyy')}
                </div>
                {user.referrerId !== '0' && (
                  <div className="d-flex align-items-center justify-content-center tx-10">
                    {t('common.by')}
                    <button
                      className="btn btn-link tx-10 tx-warning text-decoration-none px-0 py-0 ms-1"
                      onClick={() => setUserAddress(user?.referrer)}
                    >
                      {t('common.id')} {user.referrerId}
                    </button>
                  </div>
                )}
              </div>

              <div className="col-md-4 mb-3">
                <div className="px-md-4 mb-4">
                  <div className="px-1 bg-pink wd-100p tx-white text-uppercase">
                    {t('common.tower-profit')}
                  </div>
                  <div className="tx-pink tx-24">
                    {tokenValue(user.levelsRewardSum, 18)} BNB
                  </div>
                </div>

                <div className="px-md-4 mb-4">
                  <div className="px-1 bg-orange wd-100p tx-white text-uppercase">
                    {t('common.referral-payouts')}
                  </div>
                  <div className="tx-orange tx-24">
                    {tokenValue(user.referralPayoutSum, 18)} BNB
                  </div>
                </div>

                <div className="px-md-4">
                  <div className="px-1 bg-danger wd-100p tx-white text-uppercase">
                    {t('common.missed-referral-payouts')}
                  </div>
                  <div className="tx-danger tx-24">
                    {tokenValue(user.missedReferralPayoutSum, 18)} BNB
                  </div>
                </div>
              </div>

              {currentUserAddress === userAddress && (
                <div className="col-md-4 mb-3">
                  <div className="card card--referral">
                    <div className="card-header">
                      <span>{t('dashboard.my-personal')}</span>
                      <span>{t('dashboard.link')}</span>
                    </div>

                    <div className="card-body">
                      <CopyButton
                        text={referralLink}
                        element={referralLink}
                        className="btn btn-link px-0 d-block wd-100p tx-white tx-center text-decoration-none"
                        noIcon
                      />
                    </div>

                    <div className="card-footer">
                      <CopyButton text={referralLink} element={t('common.copy')} className="btn btn-pink" noIcon/>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <QueryTableOld title={"Tower activities"}/>
      </div>

      {(isPending || isUserLoading || !user || !userAddress) && <Preloader/>}
    </React.Suspense>
  )
}
