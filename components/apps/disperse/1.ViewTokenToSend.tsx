import React, {useState} from 'react';
import ComboboxAddressInput from 'components/common/ComboboxAddressInput';
import tokenlist from 'utils/tokenLists.json';
import {getNativeToken} from 'utils/toWagmiProvider';
import axios from 'axios';
import {Step, useDisperse} from '@disperse/useDisperse';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TTokenInfo, TTokenList} from 'contexts/useTokenList';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';

function ViewTokenToSend({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {currentStep, tokenToDisperse, set_tokenToDisperse} = useDisperse();
	const [tokenToSend, set_tokenToSend] = useState<string>(ETH_TOKEN_ADDRESS);
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const [possibleTokenToReceive, set_possibleTokenToReceive] = useState<TDict<TTokenInfo>>({
		[ETH_TOKEN_ADDRESS]: getNativeToken()
	});

	/* 🔵 - Yearn Finance **************************************************************************
	** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	** will be used to populate the tokenToDisperse token combobox.
	** Only the tokens in that list will be displayed as possible destinations.
	**********************************************************************************************/
	useMountEffect((): void => {
		axios.all([axios.get('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/1/yearn.json')]).then(axios.spread((yearnResponse): void => {
			const cowswapTokenListResponse = tokenlist as TTokenList;
			const yearnTokenListResponse = yearnResponse.data as TTokenList;
			const possibleDestinationsTokens: TDict<TTokenInfo> = {};
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = getNativeToken();
			for (const eachToken of cowswapTokenListResponse.tokens) {
				if (eachToken.extra) {
					continue;
				}
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
			for (const eachToken of yearnTokenListResponse.tokens) {
				if (eachToken.symbol.startsWith('yv')) {
					possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
				}
			}
			set_possibleTokenToReceive(possibleDestinationsTokens);
		}));
	});

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
				<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Select token to disperse'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Choose the token you’d like to send to multiple recipient. If it’s not listed, you can enter the token address manually.'}
						</p>
					</div>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'mt-6 grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:w-3/4 md:gap-6'}>
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
										set_tokenToSend(newToken);
									}
								}} />
						</div>
						<div className={'col-span-12 md:col-span-3'}>
							<Button
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
								isDisabled={!isValidTokenToReceive || tokenToDisperse.chainId === 0}>
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
