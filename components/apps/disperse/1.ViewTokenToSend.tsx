import React, {useCallback, useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {zeroAddress} from 'viem';
import {Step, useDisperse} from '@disperse/useDisperse';
import {useDeepCompareEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {IconSettings} from '@yearn-finance/web-lib/icons/IconSettings';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import ComboboxAddressInput from '@common/ComboboxAddressInput';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

function ViewTokenToSend({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {safeChainID} = useChainID();
	const {getBalance} = useWallet();
	const {currentStep, set_tokenToDisperse} = useDisperse();
	const [tokenToSend, set_tokenToSend] = useState<TToken | null>(null);
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const [possibleTokenToReceive, set_possibleTokenToReceive] = useState<TDict<TToken>>({});
	const {tokenList, openTokenListModal} = useTokenList();

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
			if (eachToken.address === toAddress('0x0000000000000000000000000000000000001010')) {
				continue; //ignore matic erc20
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_possibleTokenToReceive(possibleDestinationsTokens);
	}, [tokenList, safeChainID]);

	/* 🔵 - Yearn Finance **************************************************************************
	 ** When the tokenToDisperse token changes, check if it is a valid tokenToDisperse token. The check is
	 ** trivial as we only check if the address is valid.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		set_isValidTokenToReceive('undetermined');
		if (!isZeroAddress(tokenToSend?.address)) {
			set_isValidTokenToReceive(true);
		}
	}, [tokenToSend]);

	/* 🔵 - Smoldapp *******************************************************************************
	 ** On selecting a new tokenToDisperse token, update the destination object with the new token
	 **********************************************************************************************/
	const onUpdateToken = useCallback(
		(newToken: TToken): void => {
			if ([Step.SELECTOR].includes(currentStep)) {
				set_tokenToSend(newToken);
				set_tokenToDisperse({
					address: newToken.address,
					chainID: safeChainID,
					name: newToken.name,
					symbol: newToken.symbol,
					decimals: newToken.decimals,
					logoURI: newToken.logoURI
				});
			} else {
				set_tokenToSend(newToken);
			}
		},
		[currentStep, safeChainID, set_tokenToDisperse]
	);

	/* 🔵 - Smoldapp *******************************************************************************
	 ** When the user clicks the "Next" button, check if the tokenToDisperse token is valid. If it is
	 ** then proceed to the next step.
	 **********************************************************************************************/
	const onProceedToNextStep = useCallback((): void => {
		if (tokenToSend) {
			set_tokenToDisperse({
				address: tokenToSend.address,
				chainID: safeChainID,
				name: tokenToSend.name,
				symbol: tokenToSend.symbol,
				decimals: tokenToSend.decimals,
				logoURI: tokenToSend.logoURI
			});
		}
		onProceed();
	}, [onProceed, safeChainID, set_tokenToDisperse, tokenToSend]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div
						className={'absolute right-4 top-4 cursor-pointer'}
						onClick={openTokenListModal}>
						<IconSettings className={'transition-color h-4 w-4 text-neutral-400 hover:text-neutral-900'} />
					</div>
					<div className={'w-full md:w-3/4'}>
						<b>{'Which token do you want to send?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{
								'Pick the token you’d like to disperse, (aka send to multiple recipients or wallets). Token not listed? Don’t worry anon, just enter the token address manually. Go you.'
							}
						</p>
					</div>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={cl(
							'mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4 md:w-3/4 md:gap-6'
						)}>
						<div className={'grow-1 col-span-12 flex w-full flex-col md:col-span-9'}>
							<ComboboxAddressInput
								shouldSort={true}
								value={tokenToSend}
								possibleValues={possibleTokenToReceive}
								onAddValue={set_possibleTokenToReceive}
								onChangeValue={(newToken): void => onUpdateToken(newToken)}
							/>
							<small
								suppressHydrationWarning
								className={cl(
									'pl-1 pt-1 text-xxs',
									isZeroAddress(tokenToSend?.address) ? 'invisible pointer-events-none' : ''
								)}>
								{`You have ${formatAmount(
									getBalance(toAddress(tokenToSend?.address)).normalized,
									6,
									6
								)} ${tokenToSend?.symbol || 'tokens'}`}
							</small>
						</div>
						<div className={'col-span-12 md:col-span-3'}>
							<Button
								variant={'filled'}
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={onProceedToNextStep}
								isDisabled={
									!isValidTokenToReceive ||
									tokenToSend?.chainID === 0 ||
									toAddress(tokenToSend?.address) === zeroAddress
								}>
								{'Next'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ViewTokenToSend;
