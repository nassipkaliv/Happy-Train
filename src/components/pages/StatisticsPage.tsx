import React, {useTransition} from "react";
import {useRecoilValue} from "recoil";
import Preloader from "@components/Preloader";
import {tokenValue} from "@helpers/formatters";
import QueryTableOld from "@components/QueryTable";
import {globalStatisticsState} from "@stores/contract";
import {useTranslation} from "react-i18next";

export default function StatisticsPage() {
  const {t} = useTranslation();
  const [isPending] = useTransition();
  const globalStatistics = useRecoilValue(globalStatisticsState);

  return (
    <React.Suspense fallback={<Preloader/>}>
      <div className="container-fluid py-2">
        <div className="d-md-flex align-items-center mb-2">
          <h1 className="mb-md-0">{t('statistics.title')}</h1>
        </div>

        {globalStatistics && (
          <>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-pink wd-100p tx-white text-uppercase">
                    {t('statistics.total-users')}
                  </div>
                  <div className="tx-pink tx-24">
                    {globalStatistics.members}
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-orange wd-100p tx-white text-uppercase">
                    {t('statistics.total-transactions')}
                  </div>
                  <div className="tx-orange tx-24">
                    {globalStatistics.transactions}
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div>
                  <div className="px-1 bg-danger wd-100p tx-white text-uppercase">
                    {t('statistics.total-turnover')}
                  </div>
                  <div className="tx-danger tx-24">
                    {tokenValue(globalStatistics.turnover, 18)} BNB
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <QueryTableOld type="global" title="Global Activities"/>
      </div>

      {(isPending || !globalStatistics) && <Preloader/>}
    </React.Suspense>
  )
}
