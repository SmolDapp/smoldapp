import React, {useCallback, useMemo, useRef, useState} from 'react';
import {defaultInputAddressLike} from 'components/designSystem/SmolAddressInput';
import {Button} from 'components/Primitives/Button';
import axios from 'axios';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {decodeAsBigInt, decodeAsNumber, decodeAsString, toNormalizedBN} from '@builtbymom/web3/utils';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {erc20ABI, readContracts} from '@wagmi/core';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import AddressInput from '@common/AddressInput';

import type {TInputAddressLike} from 'components/designSystem/SmolAddressInput';
import type {TToken, TTokenList} from '@builtbymom/web3/types';

type TValue = {
	label: string;
	isValid: boolean | 'undetermined';
	list: TTokenList | undefined;
};
type TTokenListAddBox = {
	onAddTokenList: (list: TTokenList) => void;
	onAddToken: (token: TToken) => void;
};
function TokenListAddBox({onAddTokenList, onAddToken}: TTokenListAddBox): React.ReactElement {
	const {safeChainID} = useChainID();
	const [value, set_value] = useState<TValue>({label: '', isValid: 'undetermined', list: undefined});
	const [extraToken, set_extraToken] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [isLoadingTokenList, set_isLoadingTokenList] = useState<boolean>(false);
	const [isLoadingTokenAddress, set_isLoadingTokenAddress] = useState<boolean>(false);
	const currentLabel = useRef<string>('');

	const statusURI = useMemo((): 'valid' | 'invalid' | 'warning' | 'pending' | 'none' => {
		if (value.isValid === true) {
			return 'valid';
		}
		if (value.isValid === false && value.label !== '' && !isLoadingTokenList) {
			return 'invalid';
		}
		if (isLoadingTokenList) {
			return 'pending';
		}
		return 'none';
	}, [value, isLoadingTokenList]);

	const onChangeURI = useCallback(
		async (label: string): Promise<void> => {
			currentLabel.current = label;

			if (!label.endsWith('.json')) {
				return set_value({label, isValid: false, list: undefined});
			}

			set_value({label, isValid: 'undetermined', list: undefined});
			set_isLoadingTokenList(true);

			const [fromLabel] = await Promise.allSettled([axios.get(label)]);
			if (fromLabel.status === 'fulfilled') {
				//Check if we got name, logoURI and tokens array
				const {name, logoURI, tokens} = fromLabel.value.data;
				if (name && logoURI && Array.isArray(tokens) && tokens.length > 0) {
					//Check if the tokens contains address, name, symbol, logoURI, chainID and decimals
					const areTokensValid = (tokens as TToken[]).every((eachToken: TToken): boolean => {
						const {address, name, symbol, logoURI, chainID, decimals} = eachToken;
						return Boolean(
							address &&
								name !== undefined &&
								symbol !== undefined &&
								logoURI !== undefined &&
								chainID &&
								decimals
						);
					});
					if (currentLabel.current === label) {
						set_value({
							label,
							isValid: areTokensValid,
							list: {...(fromLabel.value.data as TTokenList), uri: label}
						});
					}
					set_isLoadingTokenList(false);
				}
			} else {
				if (currentLabel.current === label) {
					set_value({label, isValid: false, list: undefined});
				}
				set_isLoadingTokenList(false);
			}
		},
		[currentLabel]
	);

	const onSubmitURI = useCallback(
		async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
			e.preventDefault();
			if (value.isValid === true && value.list) {
				onAddTokenList(value.list);
				set_value({label: '', isValid: 'undetermined', list: undefined});
			}
		},
		[value, onAddTokenList]
	);

	const onSubmitAddress = useCallback(
		async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
			e.preventDefault();
			if (extraToken.isValid === true && extraToken.address) {
				set_isLoadingTokenAddress(true);
				const [name, symbol, decimals] = await readContracts({
					contracts: [
						{abi: erc20ABI, address: extraToken.address, functionName: 'name'},
						{abi: erc20ABI, address: extraToken.address, functionName: 'symbol'},
						{abi: erc20ABI, address: extraToken.address, functionName: 'decimals'}
					]
				});
				onAddToken({
					address: extraToken.address,
					chainID: safeChainID,
					name: decodeAsString(name),
					symbol: decodeAsString(symbol),
					decimals: Number(decodeAsBigInt(decimals)) || decodeAsNumber(decimals),
					logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${extraToken.address}/logo-32.png`,
					value: 0,
					price: toNormalizedBN(0),
					balance: toNormalizedBN(0)
				});
				set_extraToken(defaultInputAddressLike);
				set_isLoadingTokenAddress(false);
			}
		},
		[extraToken.isValid, extraToken.address, onAddToken, safeChainID]
	);

	return (
		<div className={'mt-4 px-4 md:mt-6 md:px-6'}>
			<div className={'bg-primary-50 rounded-md p-2 md:p-4'}>
				<p className={'text-sm text-neutral-700'}>
					{
						"Need more tokens? Add a single token via it's contract address, or add a custom token list for extra tokens. You can also browse existing token lists "
					}
					<a
						href={'https://smold.app/tokenlistooor'}
						target={'_blank'}
						rel={'noreferrer'}
						className={'text-primary-900 font-medium hover:underline'}>
						{'here'}
					</a>
					{'.'}
				</p>
				<form
					onSubmit={onSubmitURI}
					className={'mt-2 flex flex-row gap-4'}>
					<div className={'smol--input-wrapper'}>
						<input
							aria-invalid={statusURI === 'invalid'}
							onFocus={async (): Promise<void> => onChangeURI(value.label)}
							onChange={async (e): Promise<void> => onChangeURI(e.target.value)}
							value={value.label}
							required
							autoComplete={'off'}
							spellCheck={false}
							className={'smol--input pr-6'}
							type={'text'}
							placeholder={'https://...'}
						/>
						<label
							className={
								statusURI === 'invalid' || statusURI === 'warning'
									? 'relative'
									: 'pointer-events-none relative size-4'
							}>
							<span
								className={
									statusURI === 'invalid' || statusURI === 'warning'
										? 'tooltip'
										: 'pointer-events-none'
								}>
								<div className={'pointer-events-none relative size-4'}>
									<IconCircleCheck
										className={`absolute size-4 text-green transition-opacity ${
											statusURI === 'valid' ? 'opacity-100' : 'opacity-0'
										}`}
									/>
									<IconCircleCross
										className={`absolute size-4 text-red transition-opacity ${
											statusURI === 'invalid' ? 'opacity-100' : 'opacity-0'
										}`}
									/>
									<div className={'absolute inset-0 flex items-center justify-center'}>
										<IconLoader
											className={`size-4 animate-spin text-neutral-900 transition-opacity ${
												statusURI === 'pending' ? 'opacity-100' : 'opacity-0'
											}`}
										/>
									</div>
								</div>
								<span className={'tooltiptextsmall'}>
									{statusURI === 'invalid' && 'This address is invalid'}
									{statusURI === 'warning' && 'This address is already in use'}
								</span>
							</span>
						</label>
					</div>
					<div>
						<Button
							isDisabled={value.isValid !== true}
							isBusy={isLoadingTokenList}
							className={'whitespace-nowrap'}>
							{'Add list'}
						</Button>
					</div>
				</form>
				<p className={'mt-4 text-sm text-neutral-700'}>
					{'You can also provide a single token address to add it to your list.'}
				</p>
				<form
					onSubmit={onSubmitAddress}
					className={'mt-2 flex flex-row gap-4'}>
					<AddressInput
						inputClassName={'text-normal font-normal'}
						value={extraToken}
						onChangeValue={(e): void => set_extraToken(e)}
					/>
					<div>
						<Button
							isDisabled={extraToken.isValid !== true}
							isBusy={isLoadingTokenAddress}
							className={'whitespace-nowrap'}>
							{'Add Token'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

export {TokenListAddBox};
