import React, {Fragment, useState} from 'react';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, zeroNormalizedBN} from '@builtbymom/web3/utils';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TDict, TToken} from '@builtbymom/web3/types';

function SectionYourTokens(): ReactElement {
	const {safeChainID} = useChainID();
	const {currentNetworkTokenList} = useTokenList();
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
				value: 0,
				balance: zeroNormalizedBN,
				logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-32.png`
			};
		}
		for (const eachToken of Object.values(currentNetworkTokenList)) {
			if (eachToken.address === ETH_TOKEN_ADDRESS) {
				continue;
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_possibleTokens(possibleDestinationsTokens);
	}, [currentNetworkTokenList, safeChainID]);

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(possibleTokens)) {
			if (getBalance({address: dest.address, chainID: safeChainID}).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokens, getBalance, safeChainID]);

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
								<Counter
									value={Number(
										getBalance({address: token.address, chainID: safeChainID}).normalized
									)}
									decimals={token.decimals}
								/>
							</b>
							<small className={'font-number text-neutral-900/60'}>{'$ 1414'}</small>
						</p>
					</div>
				</div>
			))}
		</Fragment>
	);
}

function Index(): ReactElement {
	return (
		<Fragment>
			<div>
				<section className={'z-10 mx-auto mt-10 grid w-full max-w-5xl'}></section>
			</div>

			<div>
				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<div className={'flex flex-row items-center justify-between'}>
						<h2 className={'text-neutral-500 scroll-m-20 pb-4 text-xl'}>{'Your tokens'}</h2>
					</div>
					<SectionYourTokens />
				</section>
			</div>
			<div className={'h-44'} />
		</Fragment>
	);
}

Index.AppName = 'Send';
Index.AppDescription = 'Deliver any of your tokens anywhere';
Index.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default Index;
