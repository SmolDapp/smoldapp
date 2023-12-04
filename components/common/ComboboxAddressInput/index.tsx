import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {useWallet} from 'contexts/useWallet';
import {isAddress} from 'viem';
import {erc20ABI} from 'wagmi';
import {Combobox, Transition} from '@headlessui/react';
import {useThrottledState} from '@react-hookz/web';
import {multicall} from '@wagmi/core';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {decodeAsNumber, decodeAsString} from '@yearn-finance/web-lib/utils/decoder';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import {PossibleOption} from './PossibleOption';
import {SelectedOption} from './SelectedOption';
import {useFilterTokens} from './useFilterTokens';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TComboboxAddressInput, TToken} from '@utils/types/types';

function Backdrop({isOpen, onClose}: {isOpen: boolean; onClose: VoidFunction}): ReactElement {
	if (!isOpen) {
		return <></>;
	}
	return (
		<div
			className={'fixed inset-0 z-0'}
			onClick={(e): void => {
				e.stopPropagation();
				e.preventDefault();
				onClose();
			}}
		/>
	);
}

function WithTransition({children, isOpen}: {children: ReactElement; isOpen: boolean}): ReactElement {
	return (
		<Transition
			as={Fragment}
			show={isOpen}
			enter={'transition duration-100 ease-out'}
			enterFrom={'transform scale-95 opacity-0'}
			enterTo={'transform scale-100 opacity-100'}
			leave={'transition duration-75 ease-out'}
			leaveFrom={'transform scale-100 opacity-100'}
			leaveTo={'transform scale-95 opacity-0'}>
			{children}
		</Transition>
	);
}

function Options(
	props: TComboboxAddressInput & {
		isOpen: boolean;
		onToggle: Dispatch<SetStateAction<boolean>>;
		activaValue: TToken | undefined;
		isLoadingTokenData: boolean;
	}
): ReactElement {
	const {balances} = useWallet();
	const [query, set_query] = useState<string>('');
	const filteredValues = useFilterTokens(Object.values(props.possibleValues), query);

	const filteredBalances = useMemo((): [TToken[], TToken[]] => {
		if (!props.shouldSort) {
			return [filteredValues, []];
		}
		const withBalance = [];
		const withoutBalance = [];
		for (const dest of filteredValues) {
			if (toBigInt(balances?.[toAddress(dest.address)]?.raw) > 0n) {
				withBalance.push(dest);
			} else {
				withoutBalance.push(dest);
			}
		}
		return [withBalance, withoutBalance];
	}, [balances, filteredValues, props.shouldSort]);

	return (
		<div className={'relative'}>
			<SelectedOption
				activeValue={props.activaValue}
				currentValue={props.value}
				query={query}
				isFetchingNewToken={props.isLoadingTokenData}
				onToggleOptions={props.onToggle}
				onChange={(event): void => {
					props.onToggle(true);
					set_query(event.target.value);
				}}
			/>
			<WithTransition isOpen={props.isOpen}>
				<Combobox.Options
					className={cl(
						'absolute left-0 z-50',
						'flex max-h-60 w-full min-w-fit flex-col',
						'box-0 mt-1 overflow-y-auto scrollbar-none'
					)}>
					{filteredValues.length === 0 && query !== '' ? (
						<div className={'relative cursor-default select-none px-4 py-2 text-neutral-500'}>
							{'No token found.'}
						</div>
					) : (
						[...filteredBalances[0], ...filteredBalances[1]].slice(0, 100).map(
							(dest): ReactElement => (
								<PossibleOption
									key={`${dest.address}_${dest.chainID}`}
									option={dest}
								/>
							)
						)
						[...filteredBalances[0], ...(props.shouldHideZeroBalance ? [] : filteredBalances[1])]
							.slice(0, 100)
							.map(
								(dest): ReactElement => (
									<PossibleOption
										key={`${dest.address}_${dest.chainID}`}
										option={dest}
									/>
								)
							)
					)}
				</Combobox.Options>
			</WithTransition>
		</div>
	);
}

function ComboboxAddressInput({
	possibleValues,
	value,
	onChangeValue,
	onAddValue,
	shouldSort = true,
	shouldHideZeroBalance = false
}: TComboboxAddressInput): ReactElement {
	const {safeChainID} = useChainID();
	const {refresh} = useWallet();
	const [isOpen, set_isOpen] = useThrottledState<boolean>(false, 100);
	const [isLoadingTokenData, set_isLoadingTokenData] = useState<boolean>(false);

	const fetchToken = useCallback(
		async (
			_safeChainID: number,
			_query: TAddress
		): Promise<{name: string; symbol: string; decimals: number} | undefined> => {
			if (!isAddress(_query)) {
				return undefined;
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
			return {name, symbol, decimals};
		},
		[refresh]
	);

	const onChange = useCallback(
		async (_selected: TToken): Promise<void> => {
			let _tokenData = _selected;
			if (!_tokenData || (!_tokenData.name && !_tokenData.symbol && !_tokenData.decimals)) {
				set_isLoadingTokenData(true);
				const result = await fetchToken(safeChainID, _selected.address);
				_tokenData = {
					..._tokenData,
					name: result?.name || '',
					symbol: result?.symbol || '',
					decimals: result?.decimals || 0,
					chainID: safeChainID,
					logoURI: `${process.env.SMOL_ASSETS_URL}/token/${_selected.chainID}/${_selected.address}/logo-32.png`
				};
				set_isLoadingTokenData(false);
			}

			onAddValue((prev: TDict<TToken>): TDict<TToken> => {
				if (prev[_selected.address]) {
					return prev;
				}
				return {...prev, [toAddress(_selected.address)]: _tokenData};
			});
			onChangeValue(_tokenData);
			set_isOpen(false);
		},
		[fetchToken, safeChainID, onAddValue, onChangeValue, set_isOpen]
	);

	return (
		<div className={'w-full'}>
			<Backdrop
				isOpen={isOpen}
				onClose={(): void => set_isOpen(false)}
			/>
			<Combobox<TToken | undefined>
				value={value}
				onChange={onChange}>
				{(comboOptions): ReactElement => (
					<Options
						isOpen={isOpen}
						onToggle={set_isOpen}
						activaValue={comboOptions.activeOption as TToken | undefined}
						possibleValues={possibleValues}
						value={value}
						onChangeValue={onChangeValue}
						onAddValue={onAddValue}
						shouldSort={shouldSort}
						shouldHideZeroBalance={shouldHideZeroBalance}
						isLoadingTokenData={isLoadingTokenData}
					/>
				)}
			</Combobox>
		</div>
	);
}

export default ComboboxAddressInput;
