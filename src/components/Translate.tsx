import React from "react";
import {Trans, withTranslation} from "react-i18next";

export interface TranslateProps {
  i18nKey: string;
}

function Translate({i18nKey}: TranslateProps) {
  return (
    <Trans
      i18nKey={i18nKey}
      components={{
        primary: <span className="tx-primary"/>,
        gold: <span className="tx-gold"/>,
        bold: <span className="tx-bold"/>,
        primaryBold: <span className="tx-bold tx-primary"/>,
        big: <span className="tx-24"/>,
      }}
    />
  );
}

export default React.memo(withTranslation()(Translate));
