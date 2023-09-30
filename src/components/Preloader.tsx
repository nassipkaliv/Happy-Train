import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import Translate from "@components/Translate";
import {faCircleNotch} from "@fortawesome/pro-solid-svg-icons/faCircleNotch";

export interface PreloaderProps {
  className?: string;
  iconClass?: string;
  textClass?: string;
  text?: string;
  inline?: boolean;
  longWait?: boolean;
}

export default function Preloader({className, iconClass, textClass, text, inline, longWait}: PreloaderProps) {
  const defaultClass = inline === true ? 'tx-center tx-md-left ' : 'preloader tx-center ';
  const defaultIconClass = inline === true ? 'me-2 ' : 'mb-2 ';

  return (
    <div className={defaultClass + className}>
      <span className={defaultIconClass + iconClass}><FontAwesomeIcon icon={faCircleNotch} spin/></span>
      <span className={textClass}>
        {text || (
          <Translate i18nKey={!longWait ? 'common.loading' : 'common.loading-one-minute'}/>
        )}
      </span>
    </div>
  );
}
