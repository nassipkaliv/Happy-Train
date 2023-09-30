import Moralis from "moralis";
import ExecuteFunctionSendResult = Moralis.ExecuteFunctionSendResult;
import abi from './btg_abi.json';
import {convertStringToNumber, multiply} from "@helpers/bignumber";

export interface Level {
  active: boolean;
  curPayouts: number;
  maxPayouts: number;
  activationTimes: number;
  rewardSum: string;
  referralPayoutSum: string;
  canBuild: boolean;
  canUpgrade: boolean;
}

export interface LevelsResult {
  totalLevels: number;
  levels: Level[];
}

export interface UserInfo {
  id: string;
  registrationTimestamp: string;
  referrerId: string;
  referrer: string;
  referrals: string;
  referralPayoutSum: string;
  levelsRewardSum: string;
  missedReferralPayoutSum: string;
}

export const BuildTowerGameContract = {
  contractAddress: process.env.REACT_APP_GAME_CONTRACT_ADDRESS as string,
  abi: abi,
};

export interface GlobalStatistics {
  members: number;
  transactions: number;
  turnover: number;
}

export async function BTGRegistration(referrerAddress?: string, price = '0.025'):Promise<ExecuteFunctionSendResult> {
  if (!referrerAddress) {
    const result = await Moralis.executeFunction({
      functionName: 'register',
      msgValue: Moralis.Units.ETH(price),
      ...BuildTowerGameContract
    });

    console.log(`User successfully registered`);

    return result as ExecuteFunctionSendResult;
  } else {
    const result = await Moralis.executeFunction({
      functionName: 'registerWithReferrer',
      msgValue: Moralis.Units.ETH(price),
      params: {
        referrer: referrerAddress,
      },
      ...BuildTowerGameContract
    });

    console.log(`User successfully registered`);

    return result as ExecuteFunctionSendResult;
  }
}

export async function BTGIsRegisteredUser(userAddress: string):Promise<boolean> {
  let resp = await Moralis.executeFunction({
    functionName: 'isUserRegistered',
    params: {
      addr: userAddress,
    },
    ...BuildTowerGameContract
  });

  return !!resp;
}

export async function BTGGetUserId(userAddress: string):Promise<string> {
  let resp = await Moralis.executeFunction({
    functionName: 'getUserIdByAddress',
    params: {
      userAddress: userAddress,
    },
    ...BuildTowerGameContract
  }) as unknown as number;

  return multiply(resp, 1);
}

export async function BTGGetUserAddress(userId: string):Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    let resp = await Moralis.executeFunction({
      functionName: 'getUserAddressById',
      params: {
        userId: userId,
      },
      ...BuildTowerGameContract
    }) as unknown as string;

    if (resp === '0x0000000000000000000000000000000000000000') {
      reject('User not found');
    } else {
      resolve(resp);
    }
  });
}

export async function BTGLoadLevels(userAddress: string):Promise<LevelsResult> {
  let resp: [][] = await Moralis.executeFunction({
    functionName: 'getUserLevels',
    params: {
      userAddress: userAddress,
    },
    ...BuildTowerGameContract
  }) as [][];

  let results: LevelsResult = { totalLevels: resp[0].length - 1, levels: [] };
  let hasBroken = 0;
  let lastActive = 0;

  for(let i = 1; i < resp[0].length; i++) {
    results.levels.push({
      active: resp[0][i],
      curPayouts: parseInt(resp[1][i]),
      maxPayouts: parseInt(resp[2][i]),
      activationTimes: parseInt(resp[3][i]),
      rewardSum: Moralis.Units.FromWei(resp[4][i]),
      referralPayoutSum: Moralis.Units.FromWei(resp[5][i]),
      canBuild: !hasBroken && lastActive === i - 1,
      canUpgrade: !hasBroken,
    });

    if (resp[0][i]) {
      lastActive = i;
    }

    if (resp[1][i] >= resp[2][i]) {
      hasBroken = i;
    }
  }

  return results;
}

export async function BTGLevelPrices():Promise<Array<string>> {
  const result = await Moralis.executeFunction({
    functionName: 'getLevelPrices',
    ...BuildTowerGameContract
  }) as Array<number>;

  return result.filter((v, i) => i !== 0).map((price) => Moralis.Units.FromWei(price));
}

export async function BTGRegistrationPrice():Promise<string> {
  const result = await Moralis.executeFunction({
    functionName: 'registrationPrice',
    ...BuildTowerGameContract
  }) as unknown as number;

  return Moralis.Units.FromWei(result);
}

export async function BTGGetUser(userAddress: string):Promise<UserInfo> {
  const resp = await Moralis.executeFunction({
    functionName: 'getUser',
    params: {
      userAddress: userAddress,
    },
    ...BuildTowerGameContract
  }) as Array<number>;

  const converted: Array<string> = resp.map((v, i) => i === 3 ? v.toString() : multiply(v, 1));

  return {
    id: converted[0],
    registrationTimestamp: converted[1],
    referrerId: converted[2],
    referrer: converted[3],
    referrals: converted[4],
    referralPayoutSum: converted[5],
    levelsRewardSum: converted[6],
    missedReferralPayoutSum: converted[7],
  };
}

export async function BTGGetLevelQueue(userAddress: string, level: number):Promise<Array<number>> {
  return await Moralis.executeFunction({
    functionName: 'getPlaceInQueue',
    params: {
      userAddress: userAddress,
      level: level.toString(),
    },
    ...BuildTowerGameContract
  }) as Array<number>;
}

export async function BTGGetGlobalStatistic():Promise<GlobalStatistics> {
  const res = await Moralis.executeFunction({
    functionName: 'getGlobalStatistic',
    ...BuildTowerGameContract
  }) as Array<number>;

  return {
    members: convertStringToNumber(multiply(res[0], 1)),
    transactions: convertStringToNumber(multiply(res[1], 1)),
    turnover: convertStringToNumber(multiply(res[2], 1)),
  };
}

export async function BTGBuyLevel(level: number, userAddress: string, levelPrice: string):Promise<ExecuteFunctionSendResult> {
  const res = await Moralis.executeFunction({
    functionName: 'buyLevel',
    msgValue: Moralis.Units.ETH(levelPrice),
    params: {
      level: level,
    },
    ...BuildTowerGameContract
  })

  return res as ExecuteFunctionSendResult;
}

