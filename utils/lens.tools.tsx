import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {lensProtocolFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {TAddress} from '@yearn-finance/web-lib/types';

type THandleFromAddress = {defaultProfile: {handle: string}}
async function getHandleFromAddress(address: TAddress): Promise<string> {
	const {defaultProfile}: THandleFromAddress = await lensProtocolFetcher(`{defaultProfile(request: {ethereumAddress: "${address?.toLowerCase()}"}) {handle}}`);
	return defaultProfile?.handle || '';
}

type TAddressFromHandle = {profile: {ownedBy: TAddress}}
async function getAddressFromHandle(handle: string): Promise<TAddress | ''> {
	const {profile}: TAddressFromHandle = await lensProtocolFetcher(`{profile(request: {handle: "${handle?.toLowerCase()}"}) {ownedBy}}`);
	return profile?.ownedBy ? toAddress(profile?.ownedBy) : '';
}

const	lensProtocol = {
	getHandleFromAddress,
	getAddressFromHandle
};
export default lensProtocol;
