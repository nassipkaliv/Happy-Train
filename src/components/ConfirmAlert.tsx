import {confirmable, createConfirmation} from "react-confirm";
import ModalAlert, {ModalAlertProps} from "./ModalAlert";

export default function confirmAlert(options: ModalAlertProps) {
  const defaultConfirmation = createConfirmation(confirmable(ModalAlert));
  return defaultConfirmation(options);
}
