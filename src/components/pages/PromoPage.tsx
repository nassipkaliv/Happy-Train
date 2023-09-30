import React from "react";
import Preloader from "@components/Preloader";
import eng from "@assets/files/ENG.pdf";
import ch from "@assets/files/CH.pdf";
import it from "@assets/files/IT.pdf";
import esp from "@assets/files/ESP.pdf";
import {Link} from "react-router-dom";
import Flag from 'react-world-flags';
import {useTranslation} from "react-i18next";

export default function PromoPage() {
  const {t} = useTranslation();

  const promos = [
    {
      title: 'English',
      code: 'US',
      file: eng,
    },
    {
      title: 'Chinese',
      code: 'CN',
      file: ch,
    },
    {
      title: 'Italian',
      code: 'IT',
      file: it,
    },
    {
      title: 'Espanol',
      code: 'ES',
      file: esp,
    },
  ];

  return (
    <React.Suspense fallback={<Preloader/>}>
      <div className="container-fluid py-2 wd-100p ht-100p d-flex flex-column justify-content-center align-items-center">
        <h1 className="mb-3">{t('promo.title')}</h1>

        <div className="promo-links d-flex flex-column flex-lg-row justify-content-between">
          {promos.map((p) => (
            <Link
              key={`promo-${p.code}`}
              className="btn btn-primary my-2 mx-2"
              to={p.file}
              target="_blank"
            >
              <Flag code={p.code} width="20" height="16" className="me-2 valign-top mt-1" />
              {p.title}
            </Link>
          ))}
        </div>
      </div>
    </React.Suspense>
  )
}
