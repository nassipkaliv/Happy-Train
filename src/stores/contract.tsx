import {selector} from "recoil";
import {BTGGetGlobalStatistic, BTGLevelPrices, BTGRegistrationPrice, GlobalStatistics} from "@contracts/BuildTowerGame";

export const registrationPriceState = selector<string | null>({
  key: 'registrationPrice',
  get: async () => {
    return await BTGRegistrationPrice();
  },
});

export const levelPricesState = selector<Array<string> | null>({
  key: 'levelPrices',
  get: async () => {
    return await BTGLevelPrices();
  },
});

export const globalStatisticsState = selector<GlobalStatistics | null>({
  key: 'globalStatistics',
  get: async () => {
    return await BTGGetGlobalStatistic();
  },
});
