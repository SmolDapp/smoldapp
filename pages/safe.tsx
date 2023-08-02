import React, {useCallback} from 'react';
import GNOSIS_SAFE_PROXY_FACTORY from 'utils/abi/GnosisSafeProxyFactory.abi';
import {v4} from 'uuid';
import {concat, hexToBigInt, keccak256, pad, toHex} from 'viem';
import {getNetwork, prepareWriteContract, switchNetwork, writeContract} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {ReactElement} from 'react';

export function generateSaltNonce(prefix: string): string {
	const uuid = prefix + '-' + v4();
	const result = [...uuid].reduce((result, char): string => result + String(char.charCodeAt(0)), '');
	return result.substring(0, 77);
}

const ZERO = '0';
const OWNERS = [
	toAddress('0x9E63B020ae098E73cF201EE1357EDc72DFEaA518'),
	toAddress('0x17640d0D8C93bF710b6Ee4208997BB727B5B7bc2')
];

function Safe(): ReactElement {
	const {address} = useWeb3();
	const deploySafe = useCallback(async (): Promise<void> => {
		const PROXY_FACTORY = toAddress('0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'); // 1.3.0
		const SINGLETON = toAddress('0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'); // 1.3.0
		const FALLBACK_HANDLER = toAddress('0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'); // 1.3.0
		// const salt = 107785243498913371047171289786603365637004380896551117674333096340788076285457n;

		//Initializer
		const argInitializers =
			('b63e800d') + //Function signature
			('100').padStart(64, '0') + // Version
			('2').padStart(64, '0') + // Threshold
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // Address zero, TO
			pad(toHex(0x120 + 0x20 * OWNERS.length)).substring(2).padStart(64, '0') + // Data length
			FALLBACK_HANDLER.substring(2).padStart(64, '0') +
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentToken
			ZERO.padStart(64, '0') + // payment
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentReceiver
			OWNERS.length.toString().padStart(64, '0') + // owners.length
			OWNERS.map((owner): string => owner.substring(2).padStart(64, '0')).join('') + // owners
			ZERO.padStart(64, '0'); // data.length
		console.warn(argInitializers);
		const salt = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
		// console.log(salt);
		try {
			const currentNetwork = getNetwork();
			// if (currentNetwork.chain?.id !== 250) {
			// 	await switchNetwork({chainId: 250});
			// }
			// const onFantom = await prepareWriteContract({
			// 	account: address,
			// 	address: PROXY_FACTORY,
			// 	abi: GNOSIS_SAFE_PROXY_FACTORY,
			// 	functionName: 'createProxyWithNonce',
			// 	chainId: 250,
			// 	args: [
			// 		SINGLETON,
			// 		toHex(argInitializers),
			// 		salt
			// 	]
			// });
			// const resultOnFantom = await writeContract(onFantom);
			// console.warn(resultOnFantom.hash);

			if (currentNetwork.chain?.id !== 137) {
				await switchNetwork({chainId: 137});
			}
			const onPolygon = await prepareWriteContract({
				account: address,
				address: PROXY_FACTORY,
				abi: GNOSIS_SAFE_PROXY_FACTORY,
				functionName: 'createProxyWithNonce',
				chainId: 137,
				args: [
					SINGLETON,
					`0x${argInitializers}`,
					salt
				]
			});
			const resultOnPolygon = await writeContract(onPolygon);
			console.warn(resultOnPolygon.hash);
			console.log(onPolygon.result);

			// console.warn(onFantom.result === onPolygon.result, onFantom.result);
			// await walletClient.writeContract(request);
		} catch (err) {
			console.error(err);
			// console.log({err: getSafeAddressFromRevertMessage(err.cause.reason)});

		}
	}, [address]);

	const deploySafe141 = useCallback(async (): Promise<void> => {
		const PROXY_FACTORY = toAddress('0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67'); // 1.4.1
		const SINGLETON = toAddress('0x29fcB43b46531BcA003ddC8FCB67FFE91900C762'); // 1.4.1
		const FALLBACK_HANDLER = toAddress('0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99'); // 1.4.1
		// const salt = 107785243498913371047171289786603365637004380896551117674333096340788076285457n;

		//Initializer
		const argInitializers =
			('b63e800d') + //Function signature
			('100').padStart(64, '0') + // Version
			('2').padStart(64, '0') + // Threshold
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // Address zero, TO
			pad(toHex(0x120 + 0x20 * OWNERS.length)).substring(2).padStart(64, '0') + // Data length
			FALLBACK_HANDLER.substring(2).padStart(64, '0') +
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentToken
			ZERO.padStart(64, '0') + // payment
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentReceiver
			OWNERS.length.toString().padStart(64, '0') + // owners.length
			OWNERS.map((owner): string => owner.substring(2).padStart(64, '0')).join('') + // owners
			ZERO.padStart(64, '0'); // data.length

		// let callData =
		// 	SINGLETON.substring(2).padStart(64, '0') + // Singleton
		// 	('60').padStart(64, '0') + // Init code offset
		// 	toHex(salt).substring(2).padStart(64, '0') + // Salt
		// 	toHex(argInitializers.length / 2).substring(2).padStart(64, '0') + // initializer length
		// 	argInitializers; // Initializer
		// callData = callData.padEnd(Math.ceil((callData.length) / 64) * 64, '0');
		// callData = `0x1688f0b9${callData}`;
		// callData;
		// console.warn(callData, argInitializers);

		// eslint-disable-next-line no-constant-condition
		const salt = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
		console.log(salt);
		try {
			const currentNetwork = getNetwork();
			// if (currentNetwork.chain?.id !== 1) {
			// 	await switchNetwork({chainId: 1});
			// }
			// const onFantom = await prepareWriteContract({
			// 	account: address,
			// 	address: PROXY_FACTORY,
			// 	abi: GNOSIS_SAFE_PROXY_FACTORY,
			// 	functionName: 'createProxyWithNonce',
			// 	chainId: 1,
			// 	args: [
			// 		SINGLETON,
			// 		`0x${argInitializers}`,
			// 		salt
			// 	]
			// });
			// const resultOnFantom = await writeContract(onFantom);
			// console.warn(resultOnFantom.hash);

			if (currentNetwork.chain?.id !== 137) {
				await switchNetwork({chainId: 137});
			}
			const onPolygon = await prepareWriteContract({
				account: address,
				address: PROXY_FACTORY,
				abi: GNOSIS_SAFE_PROXY_FACTORY,
				functionName: 'createProxyWithNonce',
				chainId: 137,
				args: [
					SINGLETON,
					`0x${argInitializers}`,
					salt
				]
			});
			const resultOnPolygon = await writeContract(onPolygon);
			console.warn(resultOnPolygon.hash);

			console.warn(onPolygon.result === onPolygon.result, onPolygon.result);
			// await walletClient.writeContract(request);
		} catch (err) {
			console.error(err);
		}
	}, [address]);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'}>
					{'Clone a Safe.'}
				</h1>
				<b className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'Just because having the same address on all chains is way fancier.'}
				</b>
			</div>

			<div>
				<Button onClick={deploySafe141}>
					{'Deploy safe'}
				</Button>
			</div>
		</div>
	);
}

export default function SafeWrapper(): ReactElement {
	return (
		<Safe />
	);
}

