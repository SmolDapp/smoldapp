'use client';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {CloseCurtainButton} from 'components/designSystem/Curtains/InfoCurtain';
import {SmolTokenButton} from 'components/designSystem/SmolTokenButton';
import {CurtainContent} from 'components/Primitives/Curtain';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import {isAddressEqual} from 'viem';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {useBalances} from '@builtbymom/web3/hooks/useBalances.multichains';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {cl, isAddress, toAddress} from '@builtbymom/web3/utils';
import * as Dialog from '@radix-ui/react-dialog';
import {useDeepCompareMemo} from '@react-hookz/web';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

import type {ReactElement} from 'react';
import type {TAddress, TToken} from '@builtbymom/web3/types';

export type TSelectCallback = (item: TToken) => void;
export type TBalancesCurtainProps = {
	shouldOpenCurtain: boolean;
	tokensWithBalance: TToken[];
	isLoading: boolean;
	onOpenCurtain: (callbackFn: TSelectCallback) => void;
	onCloseCurtain: () => void;
};
const defaultProps: TBalancesCurtainProps = {
	shouldOpenCurtain: false,
	tokensWithBalance: [],
	isLoading: false,
	onOpenCurtain: (): void => undefined,
	onCloseCurtain: (): void => undefined
};

function FetchedToken({
	tokenAddress,
	onSelect
}: {
	tokenAddress: TAddress;
	onSelect: (token: TToken) => void;
}): ReactElement {
	const {safeChainID} = useChainID();
	const {data} = useBalances({tokens: [{address: tokenAddress, chainID: safeChainID}]});
	const token = data[safeChainID]?.[tokenAddress];
	console.warn(data);

	if (!token) {
		return <IconLoader className={'mt-7 size-4 animate-spin text-neutral-900'} />;
	}

	return (
		<SmolTokenButton
			token={token}
			isDisabled={false}
			onClick={() => onSelect(token)}
		/>
	);
}

function BalancesCurtain(props: {
	isOpen: boolean;
	tokensWithBalance: TToken[];
	isLoading: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: TSelectCallback | undefined;
	selectedTokenAddresses?: TAddress[];
}): ReactElement {
	const [searchValue, set_searchValue] = useState('');
	const {address} = useWeb3();
	const {onConnect} = useWeb3();
	const {addCustomToken} = useTokenList();

	/**************************************************************************
	 * When the curtain is opened, we want to reset the search value.
	 * This is to avoid preserving the state accross multiple openings.
	 *************************************************************************/
	useEffect((): void => {
		if (props.isOpen) {
			set_searchValue('');
		}
	}, [props.isOpen]);

	/**************************************************************************
	 * When user searches for a specific address, not present in the token list,
	 * We want to display fetch this token and display it.
	 * Memo function returns this search value if it is address and not present
	 * in the token list.
	 *************************************************************************/
	const searchTokenAddress = useMemo(() => {
		if (
			isAddress(searchValue) &&
			!props.tokensWithBalance.some(token => isAddressEqual(token.address, toAddress(searchValue)))
		) {
			return toAddress(searchValue);
		}
		return undefined;
	}, [props.tokensWithBalance, searchValue]);

	/**************************************************************************
	 * Memo function that filters the tokens user have on
	 * the search value.
	 * Only tokens the symbol or the address of which includes the search value
	 * will be returned.
	 *************************************************************************/
	const filteredTokens = useDeepCompareMemo(() => {
		return props.tokensWithBalance.filter(
			token =>
				token.symbol.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				token.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				toAddress(token.address).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
		);
	}, [searchValue, props.tokensWithBalance]);

	const balancesTextLayout = useMemo(() => {
		let balancesText = undefined;

		if (filteredTokens.length === 0 && !searchTokenAddress) {
			balancesText = 'No tokens found';
		}
		if (!address) {
			balancesText = 'No wallet connected';
		}
		if (balancesText) {
			return (
				<div>
					<p className={'text-center text-xs text-neutral-600'}>{balancesText}</p>
				</div>
			);
		}

		return null;
	}, [address, filteredTokens.length]);

	return (
		<Dialog.Root
			open={props.isOpen}
			onOpenChange={props.onOpenChange}>
			<CurtainContent>
				<aside
					style={{boxShadow: '-8px 0px 20px 0px rgba(36, 40, 51, 0.08)'}}
					className={'flex h-full flex-col overflow-y-hidden bg-neutral-0 p-6'}>
					<div className={'mb-4 flex flex-row items-center justify-between'}>
						<h3 className={'font-bold'}>{'Your Wallet'}</h3>
						<CloseCurtainButton />
					</div>
					<div className={'flex h-full flex-col gap-4'}>
						<input
							className={cl(
								'w-full border-neutral-400 rounded-lg bg-transparent py-3 px-4 text-base',
								'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
								'focus:placeholder:text-neutral-300 placeholder:transition-colors',
								'focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40'
							)}
							type={'text'}
							placeholder={'0x... or Name'}
							autoComplete={'off'}
							autoCorrect={'off'}
							spellCheck={'false'}
							value={searchValue}
							disabled={!address}
							onChange={e => set_searchValue(e.target.value)}
						/>
						<div className={'scrollable mb-8 flex flex-col items-center gap-2 pb-2'}>
							{balancesTextLayout}
							{searchTokenAddress && (
								<FetchedToken
									tokenAddress={searchTokenAddress}
									onSelect={selected => {
										props.onSelect?.(selected);
										props.onOpenChange(false);
										addCustomToken(selected);
									}}
								/>
							)}
							{address ? (
								filteredTokens.map(token => (
									<SmolTokenButton
										key={token.address}
										token={token}
										isDisabled={props.selectedTokenAddresses?.includes(token.address) || false}
										onClick={() => {
											props.onSelect?.(token);
											props.onOpenChange(false);
										}}
									/>
								))
							) : (
								<div className={'max-w-23 mt-3 w-full'}>
									<button
										onClick={() => {
											onConnect();
											props.onOpenChange(false);
										}}
										className={
											'h-8 w-full rounded-lg bg-primary text-xs transition-colors hover:bg-primaryHover'
										}>
										{'Connect Wallet'}
									</button>
								</div>
							)}
							{props.isLoading && <IconLoader className={'mt-2 size-4 animate-spin text-neutral-900'} />}
						</div>
					</div>
				</aside>
			</CurtainContent>
		</Dialog.Root>
	);
}

const BalancesCurtainContext = createContext<TBalancesCurtainProps>(defaultProps);

type TBalancesCurtainContextAppProps = {
	children: React.ReactElement;
	/******************************************************************************
	 ** If provided, tokens with such addresses will be disabled
	 *****************************************************************************/
	selectedTokenAddresses?: TAddress[];
};

export const BalancesCurtainContextApp = ({
	children,
	selectedTokenAddresses
}: TBalancesCurtainContextAppProps): React.ReactElement => {
	const [shouldOpenCurtain, set_shouldOpenCurtain] = useState(false);
	const [currentCallbackFunction, set_currentCallbackFunction] = useState<TSelectCallback | undefined>(undefined);

	const {tokensWithBalance, isLoading} = useTokensWithBalance();

	/**************************************************************************
	 * Context value that is passed to all children of this component.
	 *************************************************************************/
	const contextValue = useDeepCompareMemo(
		(): TBalancesCurtainProps => ({
			shouldOpenCurtain,
			tokensWithBalance,
			isLoading,
			onOpenCurtain: (callbackFn): void => {
				set_currentCallbackFunction(() => callbackFn);
				set_shouldOpenCurtain(true);
			},
			onCloseCurtain: (): void => set_shouldOpenCurtain(false)
		}),
		[isLoading, shouldOpenCurtain, tokensWithBalance]
	);

	return (
		<BalancesCurtainContext.Provider value={contextValue}>
			{children}
			<BalancesCurtain
				isOpen={shouldOpenCurtain}
				tokensWithBalance={tokensWithBalance}
				isLoading={isLoading}
				selectedTokenAddresses={selectedTokenAddresses}
				onOpenChange={set_shouldOpenCurtain}
				onSelect={currentCallbackFunction}
			/>
		</BalancesCurtainContext.Provider>
	);
};

export const useBalancesCurtain = (): TBalancesCurtainProps => {
	const ctx = useContext(BalancesCurtainContext);
	if (!ctx) {
		throw new Error('BalancesCurtainContext not found');
	}
	return ctx;
};
