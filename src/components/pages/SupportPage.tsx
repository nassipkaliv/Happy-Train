import React from "react";
import Preloader from "@components/Preloader";
import {useTranslation} from "react-i18next";

export default function SupportPage() {
  const {t} = useTranslation();

  return (
    <React.Suspense fallback={<Preloader/>}>
      <div className="container-fluid py-2 wd-100p ht-100p d-flex flex-column justify-content-center align-items-center">
        <h1 className="mb-4 tx-center">{t('support.title')} Hello</h1>
        <div className="promo-links d-flex justify-content-between">
          <a className="btn btn-primary mx-2" href="https://t.me/BTG_support/" target="_blank" rel="noreferrer">Telegram</a>
        </div>
      </div>
    </React.Suspense>
  )
}
