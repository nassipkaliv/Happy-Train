import React, {useEffect, useState, useTransition} from "react";
import {useRecoilValue} from "recoil";
import {loggedInAccountAtom, viewAccountAddressAtom} from "@stores/account";
import Preloader from "@components/Preloader";
import {BTGGetUser, UserInfo} from "@contracts/BuildTowerGame";
import {tokenValue} from "@helpers/formatters";
import QueryTable from "@components/QueryTable";
import {useTranslation} from "react-i18next";

export default function BonusPage() {
  const {t} = useTranslation();
  const [isPending] = useTransition();
  const currentUserAddress = useRecoilValue(loggedInAccountAtom);
  const userAddress = useRecoilValue(viewAccountAddressAtom);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isUserLoading, setUserLoading] = useState<boolean>(false);

  const loadUser = () => {
    console.log({currentUserAddress, userAddress});
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
          <h1 className="mb-md-0">{t('bonus.title')}</h1>
        </div>

        {user && (
          <>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-pink wd-100p tx-white text-uppercase">
                    {t('common.partners')}
                  </div>
                  <div className="tx-pink tx-24">
                    {user.referrals}
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-orange wd-100p tx-white text-uppercase">
                    {t('common.referral-payouts')}
                  </div>
                  <div className="tx-orange tx-24">
                    {tokenValue(user.referralPayoutSum, 18)} BNB
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-danger wd-100p tx-white text-uppercase">
                    {t('common.missed-referral-payouts')}
                  </div>
                  <div className="tx-danger tx-24">
                    {tokenValue(user.missedReferralPayoutSum, 18)} BNB
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <QueryTable type="bonuses" title={t('bonus.table-title')}/>
      </div>

      {(isPending || isUserLoading || !user || !userAddress) && <Preloader/>}
    </React.Suspense>
  )
}
