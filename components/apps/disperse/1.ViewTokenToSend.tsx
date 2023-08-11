import React, {useState} from 'react';
import ComboboxAddressInput from 'components/common/ComboboxAddressInput';
import {useTokenList} from 'contexts/useTokenList';
import {Step, useDisperse} from '@disperse/useDisperse';
import {useDeepCompareEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';

function ViewTokenToSend({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {safeChainID} = useChainID();
	const {currentStep, tokenToDisperse, set_tokenToDisperse} = useDisperse();
	const {tokenList} = useTokenList();
	const [tokenToSend, set_tokenToSend] = useState<string>(ETH_TOKEN_ADDRESS);
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const [possibleTokenToReceive, set_possibleTokenToReceive] = useState<TDict<TTokenInfo>>({});

	/* 🔵 - Yearn Finance **************************************************************************
	** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	** will be used to populate the tokenToDisperse token combobox.
	** Only the tokens in that list will be displayed as possible destinations.
	**********************************************************************************************/
	useDeepCompareEffect((): void => {
		const possibleDestinationsTokens: TDict<TTokenInfo> = {};
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainId: safeChainID,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol,
				decimals: wrappedToken.decimals,
				logoURI: `https://assets.smold.app/api/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-128.png`
			};
		}
		for (const eachToken of Object.values(tokenList)) {
			if (eachToken.chainId === safeChainID) {
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
		if (!isZeroAddress(toAddress(tokenToSend))) {
			set_isValidTokenToReceive(true);
		}
	}, [tokenToSend]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'Which token do you want to send?'}
					content={'Pick the token you’d like to disperse, (aka send to multiple recipients or wallets). Token not listed? Don’t worry anon, just enter the token address manually. Go you.'} />
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:w-3/4 md:gap-6'}>
						<div className={'grow-1 col-span-12 flex h-10 w-full items-center md:col-span-9'}>
							<ComboboxAddressInput
								value={tokenToSend}
								possibleValues={possibleTokenToReceive}
								onAddValue={set_possibleTokenToReceive}
								onChangeValue={(newToken): void => {
									if ([Step.SELECTOR].includes(currentStep)) {
										performBatchedUpdates((): void => {
											set_tokenToSend(newToken);
											set_tokenToDisperse({
												address: toAddress(newToken as string),
												chainId: 1,
												name: possibleTokenToReceive[toAddress(newToken as string)]?.name || '',
												symbol: possibleTokenToReceive[toAddress(newToken as string)]?.symbol || '',
												decimals: possibleTokenToReceive[toAddress(newToken as string)]?.decimals || 0,
												logoURI: possibleTokenToReceive[toAddress(newToken as string)]?.logoURI || ''
											});
										});
									} else {
										performBatchedUpdates((): void => {
											set_tokenToSend(newToken);
											set_tokenToDisperse({
												address: toAddress(newToken as string),
												chainId: 1,
												name: possibleTokenToReceive[toAddress(newToken as string)]?.name || '',
												symbol: possibleTokenToReceive[toAddress(newToken as string)]?.symbol || '',
												decimals: possibleTokenToReceive[toAddress(newToken as string)]?.decimals || 0,
												logoURI: possibleTokenToReceive[toAddress(newToken as string)]?.logoURI || ''
											});
										});
									}
								}} />
						</div>
						<div className={'col-span-12 md:col-span-3'}>
							<Button
								variant={'filled'}
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={(): void => {
									if (toAddress(tokenToSend) !== ZERO_ADDRESS) {
										set_tokenToDisperse({
											address: toAddress(tokenToSend),
											chainId: 1,
											name: possibleTokenToReceive[tokenToSend]?.name || '',
											symbol: possibleTokenToReceive[tokenToSend]?.symbol || '',
											decimals: possibleTokenToReceive[tokenToSend]?.decimals || 0,
											logoURI: possibleTokenToReceive[tokenToSend]?.logoURI || ''
										});
									}
									onProceed();
								}}
								isDisabled={!isValidTokenToReceive || (tokenToDisperse?.chainId || 0) === 0}>
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
