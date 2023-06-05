import lensProtocol from 'utils/lens.tools';
import {isAddress} from 'viem';
import {fetchEnsAddress} from '@wagmi/core';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {TAddress} from '@yearn-finance/web-lib/types';

export async function checkENSValidity(ens: string): Promise<[TAddress, boolean]> {
	const resolvedAddress = await fetchEnsAddress({name: ens, chainId: 1});
	if (resolvedAddress) {
		if (isAddress(resolvedAddress)) {
			return [toAddress(resolvedAddress), true];
		}
	}
	return [toAddress(), false];
}

export async function checkLensValidity(lens: string): Promise<[TAddress, boolean]> {
	const resolvedName = await lensProtocol.getAddressFromHandle(lens);
	if (resolvedName) {
		if (isAddress(resolvedName)) {
			return [toAddress(resolvedName), true];
		}
	}
	return [toAddress(), false];
}
