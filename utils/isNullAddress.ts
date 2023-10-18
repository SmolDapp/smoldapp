import { TAddress } from "@yearn-finance/web-lib/types";

export const isNullAddress = (address: TAddress): boolean => 
	address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
