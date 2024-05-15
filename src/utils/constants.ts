// export const VOLUME_THRESHOLD = 1000;

import { ethers } from "ethers";

// export const LIQUIDITY_THRESHOLD = 1;
export const VOLUME_THRESHOLD = 100;
export const LIQUIDITY_THRESHOLD = 0.3;
export const CHECK_INTERVAL = 5 * 60;
export const CLEANUP_INTERVAL = 30;
export const MAX_START_TIME = 60 * 10;
export const AGE_THRESHOLD = 30;
export const PUBLIC_CHANNEL_DELAY = 40;

export const transactionValidTime = 25 * 60;
export const splitPaymentsWith: {
  [key: string]: { address: string; share: number };
} = {
  dev: {
    address: "0x0543730fac874d4d25A8cacfaE19559c2ee7e30d",
    share: 0.35,
  },
  main: {
    address: "0xC9C46598cc854f2857199e17f747e8A7F6f9c7E3",
    share: 0.55,
  },
  revenue: {
    address: "0x605fe1eE0FBF19f01FB0F6f7f6BADe121cDF2CA8",
    share: 0.1,
  },
};

export const residueEth = ethers.utils.parseEther("0.000035").toBigInt();
export const referralCommisionFee = 0.1;
