import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Modal} from "react-bootstrap";
import {useState} from "react";
import useInterval from "@hooks/useInterval";
import {faCircleNotch} from "@fortawesome/pro-solid-svg-icons/faCircleNotch";

export interface ModalAlertProps {
  okLabel?: string;
  cancelLabel?: string;
  okVariant?: string;
  cancelVariant?: string;
  title?: string;
  confirmation: JSX.Element | string;
  show?: boolean;
  proceed?: (success: boolean) => void;
  enableEscape?: boolean;
  noOk?: boolean;
  noCancel?: boolean;
  closeTimeout?: number;
}

export default function ModalAlert(props: ModalAlertProps) {
  const {
    okLabel = 'Continue',
    cancelLabel = 'Cancel',
    okVariant = 'success',
    cancelVariant = 'danger',
    title = '',
    confirmation,
    show = true,
    proceed = () => {},
    enableEscape = true,
    noOk = false,
    noCancel = false,
    closeTimeout = 0,
  } = props;

  const [timeLeft, setTimeLeft] = useState<number>(closeTimeout);

  useInterval(() => {
    setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
  }, timeLeft > 0 ? 1000 : null);

  const header = title ? (
    <Modal.Header>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
  ) : null;

  return (
    <div className="static-modal">
      <Modal show={show} onHide={() => proceed(false)} backdrop={enableEscape ? true : 'static'} keyboard={enableEscape}>
        {header}
        <Modal.Body>
          {confirmation}
        </Modal.Body>
        <Modal.Footer>
          {!noCancel && (
            <button
              className={'btn btn-' + cancelVariant}
              onClick={() => proceed(false)}
              disabled={timeLeft !== 0}
            >
              {timeLeft !== 0 && (<FontAwesomeIcon icon={faCircleNotch} className="mr-2" spin/>)}
              {cancelLabel}
            </button>
          )}
          {!noOk && (
            <button
              className={'btn btn-' + okVariant}
              onClick={() => proceed(true)}
              disabled={timeLeft !== 0}
            >
              {timeLeft !== 0 && (<FontAwesomeIcon icon={faCircleNotch} className="mr-2" spin/>)}
              {okLabel}
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
