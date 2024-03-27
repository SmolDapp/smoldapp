import {gql, request} from 'graphql-request';
import {isAddress, toHex} from 'viem';
import {toAddress} from '@builtbymom/web3/utils';
import {retrieveConfig} from '@builtbymom/web3/utils/wagmi';
import {getEnsAddress} from '@wagmi/core';

import type {TAddress} from '@builtbymom/web3/types';

export async function retrieveENSNameFromNode(tokenId: bigint): Promise<string> {
	const labelHash = toHex(tokenId, {size: 32});
	const url = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';
	const GET_LABEL_NAME = gql`
	query {
		domains(first:1, where:{labelhash:"${labelHash}"}) {
			labelName
		}
	}`;

	const name = (await request(url, GET_LABEL_NAME)) as {domains: {labelName: string}[]};
	return name.domains[0].labelName;
}

export async function checkENSValidity(ens: string): Promise<[TAddress, boolean]> {
	try {
		const resolvedAddress = await getEnsAddress(retrieveConfig(), {name: ens, chainId: 1});
		if (resolvedAddress) {
			if (isAddress(resolvedAddress)) {
				return [toAddress(resolvedAddress), true];
			}
		}
		return [toAddress(), false];
	} catch (error) {
		return [toAddress(), false];
	}
}
