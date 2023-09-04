import React, {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import IconCheck from 'components/icons/IconCheck';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import IconSpinner from 'components/icons/IconSpinner';
import {useWallet} from 'contexts/useWallet';
import {isAddress} from 'viem';
import {erc20ABI} from 'wagmi';
import {Combobox, Transition} from '@headlessui/react';
import {useAsync, useThrottledState} from '@react-hookz/web';
import {multicall} from '@wagmi/core';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {decodeAsNumber, decodeAsString} from '@yearn-finance/web-lib/utils/decoder';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

type TComboboxAddressInput = {
	value: string;
	possibleValues: TDict<TTokenInfo>;
	onChangeValue: Dispatch<SetStateAction<string>>,
	onAddValue: Dispatch<SetStateAction<TDict<TTokenInfo>>>
}

type TElement = {
	address: TAddress;
	logoURI: string;
	symbol: string;
	decimals: number;
	balanceNormalized: number;
}
function Element(props: TElement): ReactElement {
	return (
		<div className={'flex w-full flex-row items-center space-x-4'}>
			<div className={'h-6 w-6'}>
				<ImageWithFallback
					alt={''}
					unoptimized
					src={props.logoURI || ''}
					width={24}
					height={24} />
			</div>
			<div className={'flex flex-col font-sans text-neutral-900'}>
				<div className={'flex flex-row items-center'}>
					{props.symbol}
					<p className={'font-number pl-2 text-xxs text-neutral-500'}>
						{` - ${formatAmount(props.balanceNormalized, 6, props.decimals)}`}
					</p>
				</div>
				<small className={'font-number text-xs text-neutral-500'}>{toAddress(props.address)}</small>
			</div>
		</div>
	);
}

function ComboboxOption({option}: {option: TTokenInfo}): ReactElement {
	const {balances} = useWallet();

	return (
		<Combobox.Option
			className={({active: isActive}): string => `relative cursor-pointer select-none py-2 px-4 ${isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-900'}`}
			value={toAddress(option.address)}>
			{({selected: isSelected}): ReactElement => (
				<>
					<Element
						logoURI={option.logoURI}
						symbol={option.symbol}
						address={option.address}
						decimals={option.decimals}
						balanceNormalized={balances?.[toAddress(option.address)]?.normalized || 0}
					/>
					{isSelected ? (
						<span
							className={'absolute inset-y-0 right-8 flex items-center'}>
							<IconCheck className={'absolute h-4 w-4 text-neutral-900'} />
						</span>
					) : null}
				</>
			)}
		</Combobox.Option>
	);
}

function ComboboxAddressInput({possibleValues, value, onChangeValue, onAddValue}: TComboboxAddressInput): ReactElement {
	const {safeChainID} = useChainID();
	const {balances, refresh} = useWallet();
	const [query, set_query] = useState('');
	const [isOpen, set_isOpen] = useThrottledState(false, 100);
	const [isLoadingTokenData, set_isLoadingTokenData] = useState(false);

	const fetchToken = useCallback(async (
		_safeChainID: number,
		_query: TAddress
	): Promise<{name: string, symbol: string, decimals: number} | undefined> => {
		if (!isAddress(_query)) {
			return (undefined);
		}
		const results = await multicall({
			contracts: [
				{address: _query, abi: erc20ABI, functionName: 'name'},
				{address: _query, abi: erc20ABI, functionName: 'symbol'},
				{address: _query, abi: erc20ABI, functionName: 'decimals'}
			],
			chainId: _safeChainID
		});
		const name = decodeAsString(results[0]);
		const symbol = decodeAsString(results[1]);
		const decimals = decodeAsNumber(results[2]);
		await refresh([{decimals, name, symbol, token: _query}]);
		return ({name, symbol, decimals});
	}, [refresh]);
	const [{result: tokenData}, fetchTokenData] = useAsync(fetchToken);

	const onChange = useCallback(async (_selected: TAddress): Promise<void> => {
		let _tokenData = possibleValues[_selected];
		if (!_tokenData || (!_tokenData.name && !_tokenData.symbol && !_tokenData.decimals)) {
			set_isLoadingTokenData(true);
			const result = await fetchToken(safeChainID, _selected);
			_tokenData = {
				..._tokenData,
				name: result?.name || '',
				symbol: result?.symbol || '',
				decimals: result?.decimals || 0
			};
			set_isLoadingTokenData(false);
		}

		performBatchedUpdates((): void => {
			onAddValue((prev: TDict<TTokenInfo>): TDict<TTokenInfo> => {
				if (prev[_selected]) {
					return (prev);
				}
				return ({
					...prev,
					[toAddress(_selected)]: {
						address: toAddress(_selected),
						name: _tokenData?.name || '',
						symbol: _tokenData?.symbol || '',
						decimals: _tokenData?.decimals || 18,
						chainId: safeChainID,
						logoURI: `https://assets.smold.app/api/token/${safeChainID}/${toAddress(_selected)}/logo-128.png`
					}
				});
			});
			onChangeValue(_selected);
			set_isOpen(false);
		});
	}, [possibleValues, fetchToken, safeChainID, onAddValue, onChangeValue, set_isOpen]);

	useEffect((): void => {
		fetchTokenData.execute(safeChainID, toAddress(query));
	}, [fetchTokenData, safeChainID, query]);

	const filteredValues = query === ''
		? Object.values(possibleValues || [])
		: Object.values(possibleValues || []).filter((dest): boolean =>
			`${dest.name}_${dest.symbol}`
				.toLowerCase()
				.replace(/\s+/g, '')
				.includes(query.toLowerCase().replace(/\s+/g, ''))
		);

	const filteredBalances = useMemo((): [TTokenInfo[], TTokenInfo[]] => {
		const withBalance = [];
		const withoutBalance = [];
		for (const dest of filteredValues) {
			if (toBigInt(balances?.[toAddress(dest.address)]?.raw) > 0n) {
				withBalance.push(dest);
			} else {
				withoutBalance.push(dest);
			}
		}
		return ([withBalance, withoutBalance]);
	}, [balances, filteredValues]);

	function renderElement(): ReactElement {
		const currentElement = possibleValues?.[toAddress(value)];
		return (
			<div className={'relative flex w-full flex-row items-center space-x-4'}>
				<div key={`${value}_${currentElement?.chainId || 0}`} className={'h-6 w-6'}>
					<ImageWithFallback
						alt={''}
						unoptimized
						src={currentElement?.logoURI || ''}
						width={24}
						height={24} />
				</div>
				<div className={'flex flex-col text-left font-sans text-neutral-900'}>
					<p className={'w-full overflow-x-hidden text-ellipsis whitespace-nowrap pr-4 font-normal text-neutral-900 scrollbar-none'}>
						<Combobox.Input
							className={'font-inter w-full cursor-default overflow-x-scroll border-none bg-transparent p-0 outline-none scrollbar-none'}
							displayValue={(dest: TAddress): string => possibleValues?.[toAddress(dest)]?.symbol || ''}
							placeholder={'0x...'}
							autoComplete={'off'}
							autoCorrect={'off'}
							spellCheck={false}
							onChange={(event): void => {
								performBatchedUpdates((): void => {
									set_isOpen(true);
									set_query(event.target.value);
								});
							}} />
					</p>
					<small
						suppressHydrationWarning
						className={'font-number -mt-1 text-xxs text-neutral-500'}>
						{
							query === '' ?
								`Available: ${formatAmount(balances?.[toAddress(value)]?.normalized || 0, 6, currentElement?.decimals || 18)}` : 'Available: -'
						}
					</small>
				</div>
			</div>
		);
	}

	return (
		<div className={'w-full'}>
			{isOpen ? (
				<div
					className={'fixed inset-0 z-0'}
					onClick={(e): void => {
						e.stopPropagation();
						e.preventDefault();
						set_isOpen(false);
					}} />
			) : null}
			<Combobox<unknown>
				value={value}
				onChange={onChange}>
				<div className={'relative'}>
					<Combobox.Button
						onClick={(): void => set_isOpen((o: boolean): boolean => !o)}
						className={'box-0 grow-1 col-span-12 flex h-12 w-full items-center p-2 px-4 md:col-span-9'}>
						{renderElement()}
						{isLoadingTokenData && (
							<div className={'absolute right-8'}>
								<IconSpinner className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'} />
							</div>
						)}
						<div className={'absolute right-2 md:right-3'}>
							<IconChevronBoth className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'} />
						</div>
					</Combobox.Button>
					<Transition
						as={Fragment}
						show={isOpen}
						enter={'transition duration-100 ease-out'}
						enterFrom={'transform scale-95 opacity-0'}
						enterTo={'transform scale-100 opacity-100'}
						leave={'transition duration-75 ease-out'}
						leaveFrom={'transform scale-100 opacity-100'}
						leaveTo={'transform scale-95 opacity-0'}
						afterLeave={(): void => set_query('')}>
						<Combobox.Options className={'box-0 absolute left-0 z-50 mt-1 flex max-h-60 w-full min-w-fit flex-col overflow-y-auto scrollbar-none'}>
							{filteredValues.length === 0 && query !== '' && !tokenData ? (
								<div className={'relative cursor-default select-none px-4 py-2 text-neutral-500'}>
									{'No token found.'}
								</div>
							) : filteredValues.length === 0 && query !== '' && tokenData ? (
								<ComboboxOption
									option={{
										address: toAddress(query),
										chainId: safeChainID,
										name: tokenData.name,
										symbol: tokenData.symbol,
										decimals: tokenData.decimals,
										logoURI: ''
									}} />

							) : (
								[...filteredBalances[0], ...filteredBalances[1]]
									.slice(0, 100)
									.map((dest): ReactElement => (
										<ComboboxOption
											key={`${dest.address}_${dest.chainId}`}
											option={dest} />
									))
							)}
						</Combobox.Options>
					</Transition>
				</div>
			</Combobox>
		</div>
	);
}

export default ComboboxAddressInput;
