import {getAddress, zeroAddress} from 'viem';

export type TAddressSmol = '/^0x[0-9a-f]{40}$/i';
export type TAddressWagmi = `0x${string}`;
export type TAddress = TAddressWagmi;
export type TAddressLike = TAddressSmol | TAddressWagmi | string;

/******************************************************************************
 ** toAddress - Wagmi only requires a 0xString as a valid address. To use our
 ** safest version, we need to convert it between types, and the other way
 ** around.
 *****************************************************************************/
export function toAddress(address?: TAddressLike | null): TAddress {
	if (!address) {
		return zeroAddress;
	}
	const trimmedAddress = address.trim();
	return getAddress(checksumAddress(trimmedAddress)?.valueOf());
}

/******************************************************************************
 * isAddress - Checks if a string is a valid Ethereum address.
 *****************************************************************************/
export function isAddress(value?: TAddressLike | string | undefined): boolean {
	return !isZeroAddress(toAddress(value));
}

/******************************************************************************
 * isTAddress - Checks if a string is actually a valid Ethereum address and not
 * just an hex string.
 *****************************************************************************/
export function isTAddress(address?: string | null): address is TAddress {
	const regex = /^0x([0-9a-f][0-9a-f])*$/i;
	return !!address && regex.test(address);
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

/******************************************************************************
 ** checksumAddress - Used to convert something looking like an address to
 ** a valid address. It will return the zero address if the address is not
 ** valid.
 *****************************************************************************/
function checksumAddress(address?: string | null | undefined): TAddressSmol {
	try {
		if (address && address !== 'GENESIS') {
			const checksummedAddress = getAddress(address);
			if (isTAddress(checksummedAddress)) {
				return checksummedAddress as TAddressSmol;
			}
		}
	} catch (error) {
		console.error(error);
	}
	return zeroAddress as TAddressSmol;
}

/******************************************************************************
 ** isZeroAddress - Used to check if an address is the zero address.
 *****************************************************************************/
export function isZeroAddress(address?: string): boolean {
	return toAddress(address) === toAddress(zeroAddress);
}

/******************************************************************************
 ** truncateHex is used to trucate a full hex string to a specific size with
 ** a ... in the middle. Ex: 0x1234567890abcdef1234567890abcdef12345678
 ** will be truncated to 0x1234...5678
 *****************************************************************************/
export function truncateHex(address: string | undefined, size: number): string {
	if (!isAddress(address)) {
		if (size === 0) {
			return zeroAddress;
		}
		return `${zeroAddress.slice(2, size)}...${zeroAddress.slice(-size)}`;
	}

	if (address !== undefined) {
		if (size === 0) {
			return address;
		}
		if (address.length <= size * 2 + 4) {
			return address;
		}
		return `${address.slice(2, size)}...${address.slice(-size)}`;
	}
	if (size === 0) {
		return zeroAddress;
	}
	return `${zeroAddress.slice(2, size)}...${zeroAddress.slice(-size)}`;
}
