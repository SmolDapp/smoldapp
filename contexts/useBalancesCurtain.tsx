'use client';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {CloseCurtainButton} from 'components/designSystem/Curtains/InfoCurtain';
import {CurtainContent} from 'components/Primitives/Curtain';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {cl, formatAmount, toAddress, truncateHex} from '@builtbymom/web3/utils';
import * as Dialog from '@radix-ui/react-dialog';
import {useDeepCompareMemo} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {ImageWithFallback} from '@common/ImageWithFallback';

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

function Token({
	token,
	isDisabled,
	onSelect
}: {
	token: TToken;
	isDisabled: boolean;
	onSelect: (token: TToken) => void;
}): ReactElement {
	const {getBalance} = useWallet();
	const tokenBalance = getBalance({address: token.address, chainID: token.chainID});

	return (
		<button
			onClick={() => onSelect(token)}
			className={cl(
				'mb-2 flex flex-row items-center justify-between rounded-lg p-4 w-full',
				'bg-neutral-200 hover:bg-neutral-300 transition-colors',
				'disabled:cursor-not-allowed disabled:hover:bg-neutral-200 disabled:opacity-20'
			)}
			disabled={isDisabled}>
			<div className={'flex items-center gap-2'}>
				<ImageWithFallback
					alt={token.symbol}
					unoptimized
					src={token.logoURI || ''}
					altSrc={`${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-32.png`}
					quality={90}
					width={32}
					height={32}
				/>
				<div className={'text-left'}>
					<b className={'text-left text-base'}>{token.symbol}</b>
					<p className={'text-xs text-neutral-600'}>{truncateHex(token.address, 5)}</p>
				</div>
			</div>
			<div className={'text-right'}>
				<b className={'text-left text-base'}>{formatAmount(tokenBalance.normalized, 0, 6)}</b>
				<p className={'text-xs text-neutral-600'}>{'$420.69'}</p>
			</div>
		</button>
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

		if (filteredTokens.length === 0) {
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
					className={'bg-neutral-0 flex h-full flex-col overflow-y-hidden p-6'}>
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
								'focus:border-neutral-400'
							)}
							type={'text'}
							placeholder={'0x... or Name'}
							autoComplete={'off'}
							autoCorrect={'off'}
							spellCheck={'false'}
							value={searchValue}
							onChange={e => set_searchValue(e.target.value)}
						/>
						<div className={'scrollable mb-8 flex flex-col items-center pb-2'}>
							{balancesTextLayout}

							{address &&
								filteredTokens.map(token => (
									<Token
										key={token.address}
										token={token}
										isDisabled={props.selectedTokenAddresses?.includes(token.address) || false}
										onSelect={selected => {
											props.onSelect?.(selected);
											props.onOpenChange(false);
										}}
									/>
								))}
							{props.isLoading && <IconLoader className={'mt-2 h-4 w-4 animate-spin text-neutral-900'} />}
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
