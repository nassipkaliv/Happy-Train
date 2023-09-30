import React, {useCallback, useEffect, useMemo, useState, useTransition} from "react";
import {
  BTGBuyLevel, BTGGetLevelQueue,
  BTGLoadLevels, Level,
  LevelsResult,
} from "@contracts/BuildTowerGame";
import {useRecoilState, useRecoilValue} from "recoil";
import {levelPricesState} from "@stores/contract";
import {toast} from "react-hot-toast";
import levelForConstruction from "@assets/images/levels/for_construction.png";
import levelReady from "@assets/images/levels/ready.png";
import levelWarning from "@assets/images/levels/warning.png";
import HappyTrainBoard from "@components/pages/HappyTrainPage/components/HappyTrainBoard";
import Preloader from "@components/Preloader";
import {
  balanceUpdateIdentifier,
  loggedInAccountAtom, useIsBalanceEnough,
  viewAccountAddressAtom,
  viewUserIdSelector
} from "@stores/account";
import confirmAlert from "@components/ConfirmAlert";
import {useTranslation} from "react-i18next";

export default function HappyTrainPage() {
  const {t} = useTranslation();
  const [isPending, startTransition] = useTransition();
  const levelPrices = useRecoilValue(levelPricesState);
  const [levels, setLevels] = useState<LevelsResult | null>(null);
  const [levelBuy, setLevelBuy] = useState<number>(-1);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [waitingTransaction, setWaitingTransaction] = useState<boolean>(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentUserAddress = useRecoilValue(loggedInAccountAtom);
  const userAddress = useRecoilValue(viewAccountAddressAtom);
  const userId = useRecoilValue(viewUserIdSelector);
  const [queue, setQueue] = useState<Array<number>>([0, 0]);
  const queuePlace = !queue[0] && !queue[1] ? 0 :  (1 - queue[0] / queue[1]) * 100;
  const currentLevel = levels && levels.levels[currentLevelIndex] ? levels.levels[currentLevelIndex] : null;
  const [shouldUpdateBalance, setShouldUpdateBalance] = useRecoilState(balanceUpdateIdentifier);
  const isEnough = useIsBalanceEnough();
  let timeout: ReturnType<typeof setTimeout>;

  const lastActiveLevel = useMemo(() => {
    let result = 0;
    levels?.levels.slice().reverse().forEach((level, index) => {
      if (!result && level.canBuild && level.maxPayouts) {
        result = 19 - index;
        return;
      }
    });

    return result;
  }, [levels]);

  const levelPicture = useCallback((level: Level): string => {
    if (level.active) {
      return levelReady;
    } else if (level.maxPayouts > 0) {
      return levelWarning;
    } else {
      return levelForConstruction
    }
  }, []);

  const setQueueDebounce = (value: Array<number>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setQueue(value);
    }, 50);
  }

  const getQueue = () => {
    if (!userAddress || (currentLevel && !currentLevel.active)) {
      setQueue([0,0]);
      return;
    }
    try {
      BTGGetLevelQueue(userAddress, currentLevelIndex + 1)
        .then(setQueueDebounce)
        .catch(() => setQueueDebounce([0,0]));
    } catch (e) {
      console.error(e);
      setQueueDebounce([0,0]);
    }
  };

  const loadLevels = () => {
    if (!userAddress) {
      return;
    }

    setLoading(true);

    try {
      BTGLoadLevels(userAddress)
        .then((result) => {
          setLevels(result);
          setLevelBuy(-1);
          setLoading(false);
          setWaitingTransaction(false);
          getQueue();
          console.log({result});
        })
        .catch((e) => {
          console.error(e);
          setLevelBuy(-1);
          setLoading(false);
          setWaitingTransaction(false);
        });
    } catch (e) {
      console.error(e);
      setLevelBuy(-1);
      setLoading(false);
      setWaitingTransaction(false);
    }
  };

  const handleBuy = useCallback(async() => {
    if (!levelPrices) {
      return;
    }

    const levelPrice = levelPrices[currentLevelIndex];

    if (!isEnough(levelPrice!)) {
      return;
    }

    setLevelBuy(currentLevelIndex);

    const askToBuy = await confirmAlert({
      title: t('tower.buy-floor'),
      confirmation: t('tower.buy-floor-for-bnb')
        .replace('%floor', (currentLevelIndex + 1) + '')
        .replace('%price', levelPrice + ''),
      okLabel: t('common.buy'),
      cancelVariant: 'danger',
    }).then((result) => !!result);

    if (askToBuy) {
      startTransition(() => {
        try {
          BTGBuyLevel(currentLevelIndex + 1, userAddress!, levelPrice)
            .then((result) => {
              if (result) {
                setWaitingTransaction(true);

                // @ts-ignore
                const waitPromise = result.wait();

                toast.promise(waitPromise, {
                  loading: t('alert.transaction-loading'),
                  success: t('alert.buy-floor-complete') + '',
                  error: t('error.default'),
                });

                waitPromise.then(() => {
                  setShouldUpdateBalance(shouldUpdateBalance + 1);
                  loadLevels();
                });
              } else {
                setLevelBuy(-1);
              }
            })
            .catch((e) => {
              setLevelBuy(-1);
              console.error(e);
            });
        } catch (e) {
          setLevelBuy(-1);
          toast.error(t('error.default'), {duration: 5000});
          console.error(e);
        }
      });
    } else {
      setLevelBuy(-1);
    }
  }, [t, levelPrices, shouldUpdateBalance, setShouldUpdateBalance, isEnough, userAddress, currentLevelIndex]);

  const switchLevel = (index: number) => {
    if (index !== currentLevelIndex) {
      setCurrentLevelIndex(index);
    }
  };

  useEffect(() => {
    loadLevels();
  }, [userAddress]);

  useEffect(() => {
    getQueue();
  }, [userAddress, currentLevelIndex]);

  useEffect(() => {
    setTimeout(() => {
      const level = document.querySelector(`.floor-${currentLevelIndex}`);
      if (level && levels !== null) {
        level.scrollIntoView({behavior: 'smooth'});
      }
    }, 30);
  }, [currentLevelIndex, levels]);

  return (
    <div id="happy-train-content">
      <div id="ruler">
        {levels?.levels.slice().reverse().map((level, index) => (
          <div
            className={`ruler-level ${19 - index === currentLevelIndex ? 'active' : ''} ${!level.canBuild && !level.maxPayouts? 'd-none' : ''}`}
            key={'ruler-level-' + index}
          >
            <span>{t('common.floor')} {20 - index}</span>
          </div>
        ))}
      </div>

      <div id="happy-train-building">
        <div className="d-flex flex-column ht-100p">
          {levels?.levels.slice().reverse().map((level, index) => (
            <div
              className={`building-level ${19 - index === currentLevelIndex ? 'active' : ''} ${!level.canBuild && !level.maxPayouts? 'd-none' : ''} floor-${19-index}`}
              key={'building-level-' + index}
              onClick={() => switchLevel(19 - index)}
              style={{marginTop: lastActiveLevel + 1 === 19 - index ? 'auto' : '0'}}
            >
              <div className="level-picture">
                <img src={levelPicture(level)} alt={`${t('common.floor')} ${20 - index}`} />
              </div>
              <div className="level-number"><span>{t('common.floor')} {20 - index}</span></div>
            </div>
          ))}
        </div>
      </div>


      <div id="happy-train-statistics">
        <h3 className="bg-white p-1 tx-pink mb-3">
          {currentUserAddress !== userAddress ? t('tower.tower-of-user').replace('%user', userId + '') : t('tower.my-tower')}</h3>
        <div id="level-switcher" className="mb-5 tx-center">
          <div className="tx-left mx-auto d-inline-block">
            {levels?.levels.map((level, index) => {
              let buttonClass = 'primary';

              if (level.maxPayouts) {
                if (level.curPayouts < level.maxPayouts) {
                  buttonClass = level.canUpgrade ? 'success' : 'orange';
                } else {
                  buttonClass = 'danger';
                }
              }

              return (
                <button
                  key={`level-switcher-${index}`}
                  className={`btn ${index === currentLevelIndex ? 'active' : ''} btn-${buttonClass} wd-40 ht-40 p-1 mx-1 mb-3`}
                  onClick={() => switchLevel(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>

        <HappyTrainBoard
          currentLevelIndex={currentLevelIndex}
          currentLevel={currentLevel}
          price={levelPrices? levelPrices[currentLevelIndex] : '0'}
          queuePlace={queuePlace}
          onBuy={handleBuy}
        />
      </div>

      {(isLoading || waitingTransaction || levelBuy !== -1 || isPending) && <Preloader/>}
    </div>
  );
}
