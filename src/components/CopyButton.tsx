import React, {useCallback} from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {toast} from "react-hot-toast";
import {useTranslation} from "react-i18next";
import {faCopy} from "@fortawesome/pro-solid-svg-icons/faCopy";

export interface CopyButtonProps {
  text: string;
  alertMessage?: string;
  element?: React.ReactNode;
  className?: string;
  iconClass?: string;
  noIcon?: boolean;
}

export default function CopyButton(
  {
    text,
    element,
    alertMessage = 'alert.copied',
    className = 'btn btn-link p-0 tx-left',
    iconClass,
    noIcon = false,
  }: CopyButtonProps
) {
  const {t} = useTranslation();

  const handleCopy = useCallback(() => {
    toast.success(t(alertMessage) + '', {duration: 5000});
  }, [t, alertMessage]);

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <button className={className}>
        {!noIcon && <FontAwesomeIcon icon={faCopy} className={iconClass}/>} {element ? element : text}
      </button>
    </CopyToClipboard>
  );
}
