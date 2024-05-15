interface LockedLiquidity {
  [key: string]: number;
}

interface InitLiq {
  eth: string;
  usd: string;
  timestamp: number;
}

interface CurLiq {
  eth: string;
  usd: string;
}

interface Audit {
  buy_tax: string;
  sell_tax: string;
  honeypot: any;
  is_open_source: any;
  renounced: boolean;
  is_not_proxy: boolean;
  tax_modifiable: any;
  lp_holders_count: number;
  locked_liquidity: LockedLiquidity | null;
  owner: string;
  deployer: string;
  is_flagged: boolean;
}

interface Socials {
  twitter: string | null;
  website: string | null;
  telegram: string | null;
  medium: string | null;
  reddit: string | null;
}

interface Attributes {
  volume: number;
  buys_count: number;
  sells_count: number;
  address: string;
  tokenAddress: string;
  fdv: number;
  name: string;
  symbol: string;
  created_timestamp: number;
  price_usd: string;
  init_liq: InitLiq;
  cur_liq: CurLiq;
  audit: Audit;
  socials: Socials;
  isTradingEnabled: boolean;
  low_sell_limit: boolean;
}

export interface PhotonPairData {
  id: string;
  type: string;
  attributes: Attributes;
}

export interface PhotonPairs {
  data: PhotonPairData[];
}
