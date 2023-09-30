import {atom, selector, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {useCallback, useEffect} from "react";
import {BTGGetUserId, BTGIsRegisteredUser, BTGLoadLevels, LevelsResult} from "@contracts/BuildTowerGame";
import Moralis from "moralis";
import {useMoralis} from "react-moralis";
import {convertStringToNumber, greaterThanOrEqual} from "@helpers/bignumber";
import {toast} from "react-hot-toast";

export const refAtom = atom<string | null>({
  key: 'refId',
  default: localStorage.getItem('referral'),
});

export const isRegisteredAtom = atom<boolean | null>({
  key: 'isRegistered',
  default: null,
});

export const selectedClan = atom<string | null>({
  key:'selectedClan',
  default:null
})

export const isClanSelected = selector({
  key:'isClanSelected',
  get:({get})=>{
    const clan = get(selectedClan);
    if(clan === null){
      return false
    }else{
      return true
    }
  }
});

export const loggedInAccountAtom = atom<string | null>({
  key: 'loggedInAccountAtom',
  default: null,
});

export const viewAccountAddressAtom = atom<string | null>({
  key: 'viewAccountAddressAtom',
  default: loggedInAccountAtom,
});

export const refState = selector<string | null>({
  key: 'refState',
  get: ({get}) => {
    return get(refAtom);
  },
  set: ({set}, newValue) => {
    set(refAtom, newValue);
    localStorage.setItem('referral', newValue ? newValue as string : '');
  },
});

export const userIdSelector = selector<string | null>({
  key: 'userIdSelector',
  get: async ({get}) => {
    const userAddress = get(loggedInAccountAtom);

    if (!userAddress) {
      return null;
    }

    return await BTGGetUserId(userAddress);
  },
});

export const viewUserIdSelector = selector<string | null>({
  key: 'viewUserIdSelector',
  get: async ({get}) => {
    const userAddress = get(viewAccountAddressAtom);

    if (!userAddress) {
      return null;
    }

    return await BTGGetUserId(userAddress);
  },
});

export const userLevelsLoadCounter = atom<number>({
  key: 'userLevelsLoadCounter',
  default: 0,
});

export const userLevelsSelector = selector<LevelsResult | null>({
  key: 'userLevelsSelector',
  get: async ({get}) => {
    get(userLevelsLoadCounter);

    const userAddress = get(loggedInAccountAtom);

    if (!userAddress) {
      return null;
    }

    return await BTGLoadLevels(userAddress);
  },
});

export const balanceUpdateIdentifier = atom<number>({
  key: 'balanceUpdateIdentifier',
  default: 0,
});

export const userBalanceAtom = atom<string>({
  key: 'userBalanceAtom',
  default: '0',
});

export function useIsBalanceEnough() {
  const balance = useRecoilValue(userBalanceAtom);

  return useCallback((value: number | string, message = 'Not enough BNB on your wallet to complete transaction') => {
    const isEnough = greaterThanOrEqual(convertStringToNumber(balance), convertStringToNumber(value));

    if (!isEnough) {
      toast.error(message, {duration: 5000});
    }

    return isEnough;
  }, [balance]);
}

export default function AccountStore() {
  const {web3} = useMoralis();

  const shouldUpdateBalance = useRecoilValue(balanceUpdateIdentifier);
  const userAddress = useRecoilValue(loggedInAccountAtom);
  const [viewUserAddress, setViewUserAddress] = useRecoilState(viewAccountAddressAtom);
  const [isRegistered, setRegistered] = useRecoilState(isRegisteredAtom);
  const setUserBalance = useSetRecoilState(userBalanceAtom);

  useEffect(() => {
    if (!userAddress) {
      setRegistered(null);
      setViewUserAddress(null);
      setUserBalance('0');
    }
  }, [userAddress, setRegistered, setViewUserAddress, setUserBalance]);

  useEffect(() => {
    if (userAddress && !viewUserAddress) {
      setViewUserAddress(userAddress);
    }
  }, [userAddress, viewUserAddress, setViewUserAddress]);

  useEffect(() => {
    if (!isRegistered && userAddress) {
      BTGIsRegisteredUser(userAddress).then(setRegistered);
    }
  }, [userAddress, isRegistered, setRegistered]);

  useEffect(() => {
    if (web3 && userAddress) {
      web3?.getBalance(userAddress!).then((result) => {
        setUserBalance(Moralis.Units.FromWei(result.toString()));
      });
    }
  }, [web3, userAddress, shouldUpdateBalance, setUserBalance]);

  return (<></>);
}


