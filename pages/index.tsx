import React, {Fragment, useCallback, useState} from 'react';
import SectionDonate from 'components/SectionDonate';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import ViewTokenToSend from '@disperse/1.ViewTokenToSend';
import ViewTable from '@disperse/2.ViewTable';
import ViewApprovalWizard from '@disperse/3.ViewApprovalWizard';
import {Step, useDisperse} from '@disperse/useDisperse';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

function SectionYourTokens(): ReactElement {
	const {safeChainID} = useChainID();
	const {tokenList} = useTokenList();
	const [possibleTokens, set_possibleTokens] = useState<TDict<TToken>>({});
	const {getBalance} = useWallet();

	/* 🔵 - Yearn Finance **************************************************************************
	 ** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	 ** will be used to populate the tokenToDisperse token combobox.
	 ** Only the tokens in that list will be displayed as possible destinations.
	 **********************************************************************************************/
	useDeepCompareEffect((): void => {
		const possibleDestinationsTokens: TDict<TToken> = {};
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainID: safeChainID,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol,
				decimals: wrappedToken.decimals,
				logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-32.png`
			};
		}
		for (const eachToken of Object.values(tokenList)) {
			if (eachToken.address === ETH_TOKEN_ADDRESS) {
				continue;
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_possibleTokens(possibleDestinationsTokens);
	}, [tokenList, safeChainID]);

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(possibleTokens)) {
			if (getBalance(dest.address).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokens, getBalance]);

	return (
		<Fragment>
			{filteredBalances.map(token => (
				<div
					key={token.address}
					className={'box-0 mt-2 flex w-full flex-row items-center justify-between p-4'}>
					<div className={'flex gap-4'}>
						<div>
							<ImageWithFallback
								src={`${process.env.SMOL_ASSETS_URL}/token/1/${token.address}/logo-128.png`}
								width={32}
								height={32}
								alt={''}
							/>
						</div>
						<div>
							<b>{token.symbol}</b>
							<small className={'font-number text-neutral-900/60'}>{toAddress(token.address)}</small>
						</div>
					</div>
					<div>
						<p className={'font-number text-right text-sm text-neutral-900'}>
							<b suppressHydrationWarning>
								<Counter value={Number(getBalance(token.address).normalized)} />
							</b>
							<small className={'font-number text-neutral-900/60'}>{'$ 1414'}</small>
						</p>
					</div>
				</div>
			))}
		</Fragment>
	);
}

function Disperse(): ReactElement {
	const {isWalletSafe} = useWeb3();
	const {tokenToDisperse, currentStep, set_currentStep} = useDisperse();

	const onStartDisperse = useCallback((): void => {
		set_currentStep(Step.CONFIRMATION);
		document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
		if (isWalletSafe) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		if (toAddress(tokenToDisperse?.address) === ETH_TOKEN_ADDRESS) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		return document.getElementById('APPROVE_TOKEN_TO_DISPERSE')?.click();
	}, [isWalletSafe, set_currentStep, tokenToDisperse]);

	return (
		<div className={'mx-auto grid w-full max-w-5xl'}>
			<div
				id={'tokenToSend'}
				className={`pt-10 transition-opacity ${
					[Step.SELECTOR, Step.CONFIRMATION, Step.TOSEND].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewTokenToSend
					onProceed={(): void => {
						if (currentStep === Step.TOSEND) {
							set_currentStep(Step.SELECTOR);
						}
					}}
				/>
			</div>

			<div
				id={'selector'}
				className={`pt-10 transition-opacity ${
					[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewTable onProceed={onStartDisperse} />
			</div>

			<div
				id={'tldr'}
				className={`pt-10 transition-opacity ${
					[Step.CONFIRMATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewApprovalWizard />
			</div>
		</div>
	);
}

function Index(): ReactElement {
	return (
		<Fragment>
			<div>
				<section className={'z-10 mx-auto mt-10 grid w-full max-w-5xl'}>
					<SectionDonate />
				</section>
			</div>

			<div>
				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<div className={'flex flex-row items-center justify-between'}>
						<h2 className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>{'Your tokens'}</h2>
					</div>
					<SectionYourTokens />
				</section>
			</div>
			<div className={'h-44'} />
		</Fragment>
	);
}

export default Index;
