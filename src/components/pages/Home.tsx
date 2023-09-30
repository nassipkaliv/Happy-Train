import React, {useEffect, useState} from "react";
import {useMoralis} from "react-moralis";
import {useSetRecoilState} from "recoil";
import {loggedInAccountAtom, refState} from "@stores/account";
import {useNavigate, useParams} from "react-router-dom";
import {Modal} from "react-bootstrap";
import { connectors } from "@components/Account/config";
import Preloader from "@components/Preloader";
import {toast} from "react-hot-toast";
import btgLogo from "@assets/images/btg-logo.png";
import {useTranslation} from "react-i18next";
import Moralis from "moralis";
// import {Document,Page,pdfjs} from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import readMe from '../../assets/files/main page.pdf';
// import path from 'node:path';
// import fs from 'node:fs';
// const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
// const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.js');
// fs.copyFileSync(pdfWorkerPath, './dist/pdf.worker.js');
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url,
// ).toString();

export default function Home() {
  const {t} = useTranslation();
  const { authenticate, isAuthenticated, isAuthenticating, enableWeb3 } = useMoralis();
  const setLoggedInAccount = useSetRecoilState(loggedInAccountAtom);
  const setRef = useSetRecoilState(refState);
  const {refId} = useParams();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const isWeb3Enabled = window.hasOwnProperty('web3');

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);
  const login = async (provider: string) => {
    if ((isWeb3Enabled || provider !== 'injected') && !isAuthenticated) {
      setLoading(true);
      try {
        // @ts-ignore
        // Enable web3 to get user address and chain
      await enableWeb3({ throwOnError: true, provider });
      const { account, chainId } = Moralis;

      if (!account) {
        throw new Error(
          "Connecting to chain failed, as no connected account was found"
        );
      }
      if (!chainId) {
        throw new Error(
          "Connecting to chain failed, as no connected chain was found"
        );
      }
        
        // authenticate({ signingMessage: })
        console.log(account, chainId);
        // Get message to sign from the auth api
        const { message } = await Moralis.Cloud.run("requestMessage", {
          address: Moralis.account,
          chain:  process.env.REACT_APP_CHAIN_ID, // parseInt(String(process.env.REACT_APP_CHAIN_ID), 16),
          network: "evm",
        });

        console.log("message",message)

        // Authenticate and login via parse
        await authenticate({
          signingMessage: message,
          throwOnError: true,
        }).then((user) => {
          console.log(user);
          console.log(user!.get("ethAddress"));
          setLoggedInAccount(user!.get("ethAddress"));
          window.localStorage.setItem("connectorId", provider);
          setLoading(false);
        }).catch(function (error) {
              console.log(error);
              setLoading(false);
        });
        // await authenticate({provider, signingMessage: "Log in using your wallet", chainId: Number(process.env.REACT_APP_CHAIN_ID) }        //   .then(function (user) {
        //     // console.log(user)
        //     // console.log(process.env.REACT_APP_CHAIN_ID)
        //     console.log("logged in user:", user);
        //     console.log(user!.get("ethAddress"));
        //     setLoggedInAccount(user!.get("ethAddress"));
        //     setLoading(false);
        //     window.localStorage.setItem("connectorId", provider);
        //     setShow(false);
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //     setLoading(false);
        //   });
      } catch (e) {
        console.log("falied");
        setLoading(false);
      }
    } else if (!isWeb3Enabled) {
      toast.error(
        t('error.no-web3'),
        {duration: 7000}
      );
    }
  }

  useEffect(() => {
    if (refId && parseInt(refId).toString() === refId) {
      setRef(refId);
      navigate('/');
    }
  }, [refId, setRef, navigate]);

  return (
    <div id="home">
      <button className="btn btn-pink mt-4 wd-250 wd-lg-auto connect-button" onClick={handleShow} disabled={isAuthenticating || isLoading}>
        {t('home.connect')}
      </button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {t('home.connect')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {connectors.map(({ title, icon, connectorId }, key) => (
              <div
                className="col-6 mb-4 cur-pointer ht-80 d-flex flex-column align-items-center justify-content-center"
                key={key}
                onClick={() => login(connectorId)}
              >
                <img src={icon} alt={title} className="wd-50 mb-2" />
                <div className="tx-center">{title}</div>
              </div>
            ))}
          </div>
          {(isAuthenticating || isLoading) && <Preloader/>}
        </Modal.Body>
      </Modal>
    </div>
  );
}
