import axios from 'axios';
import {formatAmount, toNormalizedBN, truncateHex, zeroNormalizedBN} from '@builtbymom/web3/utils';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';

import {EIP3770_PREFIX} from './eip-3770';

import type {TTokenAmountInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {Hex} from 'viem';
import type {TAddress, TToken} from '@builtbymom/web3/types';

const safeBaseURI = 'https://app.safe.global/transactions/tx?safe=';
export function notifyGib({
	from,
	fromName,
	to,
	toName,
	tokenName,
	amountNormalized,
	value,
	txLink
}: {
	from: string;
	fromName: string;
	to: string;
	toName: string;
	tokenName: string;
	amountNormalized: string;
	value: string;
	txLink: string;
}): void {
	axios.post('/api/notify', {
		messages: [
			'*❤️ A new gib has been detected*',
			`\t\t\t\t\t\t[${fromName}](https://etherscan.io/address/${from}) sent ${amountNormalized} ${tokenName} (~$${value}) to [${toName}](https://etherscan.io/address/${to})`,
			`\t\t\t\t\t\t[View on Etherscan](${txLink})`
		]
	});
}

export function notifyDisperse(props: {
	chainID: number;
	tokenToDisperse: TToken | undefined;
	receivers: TAddress[];
	amounts: bigint[];
	hash: Hex;
	from: TAddress;
	type: 'EOA' | 'SAFE';
}): void {
	if (!props.tokenToDisperse) {
		return;
	}
	const currentChain = getNetwork(props.chainID);
	const explorerBaseURI = currentChain?.blockExplorers?.default?.url || 'https://etherscan.io';
	const decimals = props.tokenToDisperse.decimals || 18;
	const sumDispersed = props.amounts.reduce((sum, amount): bigint => sum + amount, 0n);
	const sumDispersedNormalized = formatAmount(toNormalizedBN(sumDispersed, decimals).normalized, 6, decimals);
	const getChainPrefix = EIP3770_PREFIX.find((item): boolean => item.chainId === props.chainID);
	const chainPrefix = getChainPrefix?.shortName || 'eth';

	axios.post('/api/notify', {
		messages: [
			'*🚀 DISPERSE*',
			`\t\t\t\t\t\t${sumDispersedNormalized} ${props.tokenToDisperse.symbol} dispersed by [${truncateHex(
				props.from,
				4
			)}](${explorerBaseURI}/address/${props.from}):`,
			...props.receivers.map(
				(receiver, index): string =>
					`\t\t\t\t\t\t\t- [${truncateHex(
						receiver,
						5
					)}](${explorerBaseURI}/address/${receiver}) received ${formatAmount(
						toNormalizedBN(props.amounts[index], decimals).normalized,
						6,
						decimals
					)} ${props.tokenToDisperse?.symbol}`
			),
			props.type === 'EOA'
				? `\t\t\t\t\t\t[View on Explorer](${explorerBaseURI}/tx/${props.hash})`
				: `\t\t\t\t\t\t[View on Safe](${safeBaseURI}${chainPrefix}:${props.from}/transactions/tx?safe=eth:${props.from}&id=multisig_${props.from}_${props.hash})`
		]
	});
}

export function notifySend(props: {
	chainID: number;
	tokensMigrated: TTokenAmountInputElement[];
	hashes: Hex[];
	to: TAddress;
	from: TAddress;
	type: 'EOA' | 'SAFE';
}): void {
	const currentChain = getNetwork(props.chainID);
	const explorerBaseURI = currentChain?.blockExplorers?.default?.url || 'https://etherscan.io';
	const getChainPrefix = EIP3770_PREFIX.find((item): boolean => item.chainId === props.chainID);
	const chainPrefix = getChainPrefix?.shortName || 'eth';

	axios.post('/api/notify', {
		messages: [
			'*🚀 SEND*',
			`\t\t\t\t\t\t[${truncateHex(props.from, 5)}](${explorerBaseURI}/address/${
				props.from
			}) is sending tokens to [${truncateHex(props.to, 5)}](${explorerBaseURI}/address/${props.to}):`,
			...props.tokensMigrated.map(({token, normalizedBigAmount}, index): string => {
				const {address, symbol, decimals} = token || {};
				const txHashLink =
					props.type === 'EOA'
						? `${explorerBaseURI}/tx/${props.hashes[index]}`
						: `${safeBaseURI}${chainPrefix}:${props.from}/transactions/tx?safe=eth:${props.from}&id=multisig_${props.from}_${props.hashes[index]}`;
				return `\t\t\t\t\t\t\t- ${formatAmount(
					(normalizedBigAmount || zeroNormalizedBN).normalized,
					6,
					decimals
				)} [${symbol}](${explorerBaseURI}/address/${address}) | [tx](${txHashLink})`;
			})
		]
	});
}
