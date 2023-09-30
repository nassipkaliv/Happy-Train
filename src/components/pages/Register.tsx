import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {BTGGetUserAddress, BTGRegistration} from "@contracts/BuildTowerGame";
import {faCircleNotch} from "@fortawesome/pro-solid-svg-icons/faCircleNotch";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
  balanceUpdateIdentifier,
  isRegisteredAtom,
  loggedInAccountAtom,
  refState,
  useIsBalanceEnough
} from "@stores/account";
import {toast} from "react-hot-toast";
import {registrationPriceState} from "@stores/contract";
import {useTranslation} from "react-i18next";

export default function Register() {
  const {t} = useTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isRefAddressLoading, setRefAddressLoading] = useState<boolean>(false);
  const userAddress = useRecoilValue(loggedInAccountAtom);
  const registrationPrice = useRecoilValue(registrationPriceState);
  const setRegistered = useSetRecoilState(isRegisteredAtom);
  const refIdState = useRecoilValue(refState);
  const [shouldUpdateBalance, setShouldUpdateBalance] = useRecoilState(balanceUpdateIdentifier);
  const [refId, setRefId] = useState<string>(refIdState || '');
  const [refAddress, setRefAddress] = useState<string>('');
  const [showUpline, setShowUpline] = useState<boolean>(!!refId);
  const [regForAdmin, setForAdmin] = useState<boolean>(false);
  const isEnough = useIsBalanceEnough();

  const register = () => {
    if (refId && (!refAddress || refAddress === '0x0000000000000000000000000000000000000000')) {
      toast.error(t('error.approve-upline'), {duration: 5000});
      return;
    } else if (!refId) {
      setRefId('1');
      loadRefAddress('1');
      return;
    }

    if (refAddress === userAddress) {
      toast.error(t('error.default'), {duration: 5000});
      return;
    }

    if (!isEnough(registrationPrice!)) {
      return;
    }

    setLoading(true);

    try {
      BTGRegistration(refAddress, registrationPrice!)
        .then((result) => {
          // @ts-ignore
          const waitPromise = result.wait();

          toast.promise(waitPromise, {
            loading: t('alert.registration-loading'),
            success: t('alert.registration-complete') + '',
            error: t('alert.registration-error'),
          });

          waitPromise.then(() => {
            setShouldUpdateBalance(shouldUpdateBalance + 1);
            setLoading(false);
            setRegistered(true);
          });
        })
        .catch(() => {
          toast.error(t('alert.registration-error'), {duration: 5000});
          setLoading(false);
        });
    } catch (e) {
      toast.error(t('error.default'), {duration: 5000});
      setLoading(false);
    }
  };

  const loadRefAddress = (customRef?: string) => {
    if (!refId && !customRef) {
      return;
    } else if (customRef) {
      setForAdmin(true);
    }

    setRefAddressLoading(true);

    try {
      BTGGetUserAddress(refId || customRef || '')
        .then((result) => {
          if (result && result !== '0x0000000000000000000000000000000000000000') {
            setRefAddress(result);
          } else {
            toast.error(t('error.user-id-not-found'), {duration: 5000});
          }
          setRefAddressLoading(false);
        })
        .catch(() => {
          toast.error(t('error.user-id-not-found'), {duration: 5000});
          setRefAddressLoading(false);
        });
    } catch (e) {
      toast.error(t('error.default'), {duration: 5000});
      setRefAddressLoading(false);
    }
  };

  useEffect(() => {
    console.log({ifStatement: regForAdmin && refAddress && !isRefAddressLoading, regForAdmin, refAddress, isRefAddressLoading});
    if (regForAdmin && refAddress && !isRefAddressLoading) {
      register();
    }
  }, [regForAdmin, refAddress, isRefAddressLoading]);

  useEffect(() => {
    if (refIdState && !refAddress) {
      loadRefAddress();
    }
  }, [refIdState, refAddress]);

  return (
    <div id="register" className="container-fluid py-4">
      <div className="card card--referral wd-lg-600">
        <div className="card-header">
          <h1 className="tx-20 mt-1">{t('register.title')}</h1>
          <h3 className="tx-12">{t('register.subtitle')}</h3>
        </div>

        <div className="card-body">
          {!showUpline && (
            <button
              onClick={() => setShowUpline(true)}
              className="btn btn-primary mb-3"
            >
              {t('register.have-upline')}
            </button>
          )}

          <div id="upline" className={showUpline ? 'd-block' : 'd-none'}>
            <div className="tx-bold mb-1 tx-16">{t('register.upline-address-and-id')}</div>

            <div className="mb-1">
              {isRefAddressLoading && (
                <FontAwesomeIcon
                  className="me-2"
                  icon={faCircleNotch}
                  spin
                />
              )}
              {!refAddress && 'You need to approve your upline'}
              {!!refAddress && (
                <div className="tx-12 word-break">
                  {t('register.upline-address')} {refAddress}
                </div>
              )}
            </div>

            <div className="d-lg-flex mb-3">
              <input
                type="text"
                className={`form-control mb-0 me-2 flex-1 ${refAddress ? 'is-valid' : ''}`}
                placeholder={t('common.referral-id')}
                disabled={isLoading || isRefAddressLoading}
                value={refId}
                onChange={(event) => setRefId(event.target.value)}
              />
              <button
                className="btn btn-primary mt-2 mt-lg-0"
                type="button"
                onClick={() => loadRefAddress()}
                disabled={isLoading || isRefAddressLoading || !refId}
              >
                {t('register.approve-upline')}
              </button>
            </div>
          </div>

          <div id="terms" className="tx-12">
            {t('register.terms')}
          </div>
        </div>

        <div className="card-footer">
          <button className="btn btn-pink" onClick={register} disabled={isRefAddressLoading || isLoading}>
            {t('register.confirm')} ({registrationPrice} BNB)
          </button>
        </div>
      </div>
    </div>
  );
}
