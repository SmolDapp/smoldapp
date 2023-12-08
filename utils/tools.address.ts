import {isZeroAddress, toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import type {TAddress, TAddressLike} from '@yearn-finance/web-lib/types';

/******************************************************************************
 * isAddress - Checks if a string is a valid Ethereum address.
 *****************************************************************************/
export function isAddress(value?: TAddressLike | string | undefined): boolean {
	return !isZeroAddress(toAddress(value));
}

/******************************************************************************
 * safeAddress - Returns a string that is safe to display as an address.
 *****************************************************************************/
export function safeAddress(props: {
	address?: TAddress;
	ens?: string;
	placeholder?: string;
	addrOverride?: string;
}): string {
	if (props.ens) {
		return props.ens;
	}
	if (!isZeroAddress(props.address) && props.addrOverride) {
		return props.addrOverride;
	}
	if (!isZeroAddress(props.address)) {
		return truncateHex(props.address, 6);
	}
	if (!props.address) {
		return props.placeholder || '';
	}
	return toAddress(props.address);
}
