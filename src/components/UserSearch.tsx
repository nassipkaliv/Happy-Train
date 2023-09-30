import React, {useCallback, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {toast} from "react-hot-toast";
import {BTGGetUserAddress} from "@contracts/BuildTowerGame";
import {useSetRecoilState} from "recoil";
import {viewAccountAddressAtom} from "@stores/account";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/pro-solid-svg-icons/faSearch";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

export default function UserSearch() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const setViewUserAddress = useSetRecoilState(viewAccountAddressAtom);

  const resetForm = () => {
    setLoading(false);
    setUserId('');
  };

  const handleClose = () => {
    resetForm();
    setShow(false);
  };

  const handleShow = () => setShow(true);

  const handleSearch = useCallback(() => {
    if (!userId) {
      toast.error(t('error.enter-user-id'), {duration: 5000});
      return;
    }

    setLoading(true);

    const wait = BTGGetUserAddress(userId)
      .then((response) => {
        setLoading(false);
        setViewUserAddress(response);
        handleClose();
        navigate('/');
      })
      .catch(() => {
        setLoading(false);
        throw Error(t('alert.user-search-error'));
      });

    toast.promise(wait, {
      loading: t('alert.user-search-loading'),
      error: t('alert.user-search-error'),
      success: t('alert.user-search-complete'),
    });
  }, [t, navigate, userId, setViewUserAddress]);

  return (
    <>
      <button
        className="btn btn-sm btn-primary me-2 tx-10 tx-lg-12"
        onClick={handleShow}
      >
        <FontAwesomeIcon icon={faSearch} className="d-inline d-lg-none"/>
        <span className="d-none d-lg-inline">{t('search.title')}</span>
      </button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {t('search.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder={t('common.user-id')}
            disabled={isLoading}
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            {t('common.close')}
          </Button>

          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {t('common.search')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
