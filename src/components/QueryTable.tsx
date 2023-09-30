import {useMoralisQuery} from "react-moralis";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {viewAccountAddressAtom, viewUserIdSelector} from "@stores/account";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Preloader from "@components/Preloader";
import {formatDistance} from "date-fns";
import Moralis from "moralis";
import linkImg from "@assets/images/link.png";
import {toast} from "react-hot-toast";
import {BTGGetUserAddress} from "@contracts/BuildTowerGame";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

interface QueryTableProps {
  type?: 'events' | 'bonuses' | 'global';
  title: string;
}

export default function QueryTable({type = 'events', title = 'Activities'}: QueryTableProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const dashboardEvents = ['BuyLevel', 'LevelPayout', 'LevelDeactivation', 'IncreaseLevelMaxPayouts'];
  const bonusPageEvents = [
    ['UserRegistration'],
    ['ReferralPayout', 'MissedReferralPayout'],
  ];
  const userId = useRecoilValue(viewUserIdSelector);
  const setViewUserAddress = useSetRecoilState(viewAccountAddressAtom);
  const [events, setEvents] = useState<Array<any>>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [isFirstLine, setIsFirstLine] = useState<boolean>(true);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  let timeout: ReturnType<typeof setTimeout>;

  const { fetch: fetchEvents } = useMoralisQuery(
    "EventLog",
    (query) => query
      .descending('block_timestamp')
      .skip(skip)
      .limit(20)
      .containedIn("eventName", dashboardEvents)
      .equalTo("userId", userId),
    [userId, skip],
    { autoFetch: false }
  );

  const { fetch: fetchBonuses } = useMoralisQuery(
    "EventLog",
    (query) => query
      .descending('block_timestamp')
      .skip(skip)
      .limit(20)
      .containedIn("eventName", bonusPageEvents[isFirstLine ? 0 : 1])
      .equalTo("referrerId", userId),
    [userId, isFirstLine, skip],
    { autoFetch: false }
  );

  const { fetch: fetchGlobal } = useMoralisQuery(
    "EventLog",
    (query) => query
      .descending('block_timestamp')
      .skip(skip)
      .limit(20),
    [skip],
    { autoFetch: false }
  );

  const getEvents = async () => {
    setLoading(true);
    const results = await fetchEvents();
    if (results) {
      setEvents((prevState) => [...prevState, ...results]);
    }
    setLoading(false);
    setShouldUpdate(false);
    if (events.length && (!results || !results.length) && skip) {
      setIsEnd(true);
    }
  };

  const getBonuses = async () => {
    setLoading(true);
    const results = await fetchBonuses();
    if (results) {
      setEvents((prevState) => [...prevState, ...results]);
    }
    setLoading(false);
    setShouldUpdate(false);
    if (events.length && (!results || !results.length) && skip) {
      setIsEnd(true);
    }
  };

  const getGlobal = async () => {
    setLoading(true);
    const results = await fetchGlobal();
    if (results) {
      setEvents((prevState) => [...prevState, ...results]);
    }
    setLoading(false);
    setShouldUpdate(false);
    if (events.length && (!results || !results.length) && skip) {
      setIsEnd(true);
    }
    console.log({results});
  };

  const refresh = () => {
    if (type === 'events') {
      getEvents();
    } else if (type === 'bonuses') {
      getBonuses();
    } else {
      getGlobal();
    }
    console.log('refresh');
  };

  useEffect(() => {
    if (shouldUpdate) {
      timeout = setTimeout(refresh, 50);
    }

    return () => {
      clearTimeout(timeout);
    }
  }, [shouldUpdate]);

  useEffect(() => {
    console.log('useEffect');
    setSkip(0);
    setEvents([]);
    setIsEnd(false);
    setShouldUpdate(true);
  }, [type, userId, isFirstLine]);

  useEffect(() => {
    setShouldUpdate(true);
  }, [skip]);

  // to check for duplicates
  const transactionTextTemplate = (event: any) => {
    let result = '';
    switch (event.get('eventName')) {
      case 'BuyLevel':
        result = `Build ${event.get('level')} floor`;
        break;
      case 'LevelPayout':
        result = `Got ${Moralis.Units.FromWei(event.get('rewardValue'))} BNB rent payment for ${event.get('level')} floor. From ID ${event.get('fromUserId')}`;
        break;
      case 'LevelDeactivation':
        result = `${event.get('level')} floor has fallen into disrepair`;
        break;
      case 'IncreaseLevelMaxPayouts':
        result = `${event.get('level')} floor fortified. New max rent payments is ${event.get('newMaxPayouts')}`;
        break;
      case 'UserRegistration':
        result = `New partner registered ID ${event.get('referralId')}`;
        break;
      case 'ReferralPayout':
        result = `Got ${Moralis.Units.FromWei(event.get('rewardValue'))} BNB partner bonus from ${event.get('level')} floor. Partner ID ${event.get('referralId')}`;
        break;
      case 'MissedReferralPayout':
        result = `Miss ${Moralis.Units.FromWei(event.get('rewardValue'))} BNB partner bonus from ${event.get('level')} floor. Partner ID ${event.get('referralId')}`;
        break;
    }

    return result;
  };

  const transactionTemplate = (event: any) => {
    let result = null;
    const eventName = event.get('eventName');
    const userId = event.get('userId');
    const referrerId = event.get('referrerId');
    const showId = userId ? userId : referrerId;
    const forUserId = event.get(eventName === 'LevelPayout' ? 'fromUserId' : 'referralId');

    const idButton = (
      <button
        className="btn btn-link tx-pink p-0 ms-1"
        onClick={() => handleSearch(forUserId)}
        disabled={isLoading}
      >
        {t('common.id')} {forUserId}
      </button>
    );

    const showIdButton = type === 'global' ? (
      <button
        className="btn btn-link tx-pink p-0 ms-1 me-2"
        onClick={() => handleSearch(showId)}
        disabled={isLoading}
      >
        {t('common.user')} {showId}:
      </button>
    ) : null;

    const text =
      t('table.' + eventName)
        .replace('%floor', event.get('level'))
        .replace('%rewardValue', Moralis.Units.FromWei(event.get('rewardValue') || 0))
        .replace('%newMaxPayouts', event.get('newMaxPayouts'))
    ;

    switch (eventName) {
      case 'BuyLevel':
      case 'LevelDeactivation':
      case 'IncreaseLevelMaxPayouts':
        result = (<>
          {showIdButton}
          {text}
        </>);
        break;
      case 'LevelPayout':
      case 'MissedReferralPayout':
      case 'ReferralPayout':
      case 'UserRegistration':
        result = (<>
          {showIdButton}
          {text}
          {idButton}
        </>);
        break;
    }

    return result;
  };

  const handleSearch = useCallback((newUserId: string) => {
    if (!newUserId) {
      toast.error(t('error.enter-user-id'), {duration: 5000});
      return;
    }

    setLoading(true);

    const wait = BTGGetUserAddress(newUserId)
      .then((response) => {
        setLoading(false);
        setViewUserAddress(response);
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
  }, [t, setViewUserAddress, navigate]);

  const allowedEventIndexes = useMemo(() => {
    let list: Array<number> = [];
    let identifiers: Array<string> = [];

    events.forEach((event, index) => {
      const text = transactionTextTemplate(event);
      const hash = event.get('transaction_hash');
      if (identifiers.indexOf(text + hash) === -1) {
        identifiers.push(text + hash);
        list.push(index);
      }
    });

    return list;
  }, [events]);

  return (
    <React.Suspense fallback={<Preloader/>}>
      <div className="py-2 pos-relative">
        <div className="d-md-flex align-items-center mb-2">
          <h1 className="mb-md-0">{title}</h1>
        </div>

        {type === 'bonuses' && (
          <div className="mb-1">
            <button
              className={`btn me-2 ${isFirstLine ? 'btn-pink' : 'btn-primary'}`}
              onClick={() => setIsFirstLine(true)}
            >
              {t('table.first-line')}
            </button>
            <button
              className={`btn me-2 ${!isFirstLine ? 'btn-pink' : 'btn-primary'}`}
              onClick={() => setIsFirstLine(false)}
            >
              {t('table.reward')}
            </button>
          </div>
        )}

        <div className="query-list pos-relative">
          {events.map((event, index) => {
            if (allowedEventIndexes.indexOf(index) === -1) {
              return null;
            }

            return (
              <div className="query-item row" key={event.id}>
                <div className="col-md-9">{transactionTemplate(event)}</div>
                <div className="col-md-3 tx-right">
                  <a href={`https://bscscan.com/tx/${event.get('transaction_hash')}`} target="_blank" rel="noreferrer">
                    <img src={linkImg} alt={`https://bscscan.com/tx/${event.get('transaction_hash')}`}/>

                    {formatDistance(
                      event.get('block_timestamp'),
                      new Date(),
                      { addSuffix: true },
                    )}
                  </a>
                </div>
              </div>
            )
          })}

          {!events.length && <div>No activities</div>}
          {!isEnd && !!events.length && (
            <div className="tx-center">
              <button
                className="btn btn-pink my-2"
                onClick={() => setSkip((prevState) => prevState + 20)}
                disabled={isLoading}
              >
                {t('table.load-more')}
              </button>
            </div>
          )}
        </div>

        {isLoading && <Preloader/>}
      </div>
    </React.Suspense>
  )
}
