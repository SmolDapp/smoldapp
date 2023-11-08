import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Maybe<T> = T | null | undefined;

export type TToken = {
	address: TAddress;
	name: string;
	symbol: string;
	decimals: number;
	chainId: number;
	logoURI?: string;
	extra?: boolean;
};

export type TTokenWithAmount = TToken & {
	amount: TNormalizedBN;
	amountWithSlippage?: string;
};
