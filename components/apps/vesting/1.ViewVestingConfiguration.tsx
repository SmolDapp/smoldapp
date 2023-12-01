import React, {useCallback, useMemo, useState} from 'react';
import {Step, useVesting} from 'components/apps/vesting/useVesting';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {isAfter} from 'date-fns';
import {zeroAddress} from 'viem';
import IconChevronPlain from '@icons/IconChevronPlain';
import {useDeepCompareEffect, useDeepCompareMemo, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {IconSettings} from '@yearn-finance/web-lib/icons/IconSettings';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {type TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import AddressInput from '@common/AddressInput';
import {DatePicker} from '@common/Primitives/DatePicker';
import TokenInput from '@common/TokenInput';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

function ViewVestingConfiguration(): ReactElement {
	const {configuration, dispatchConfiguration, set_currentStep} = useVesting();
	const {safeChainID} = useChainID();
	const {getBalance} = useWallet();
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
			if (eachToken.address === ETH_TOKEN_ADDRESS) {
				continue;
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
		if (!isZeroAddress(configuration.tokenToSend?.address)) {
			set_isValidTokenToReceive(true);
		}
	}, [configuration.tokenToSend]);

	/* 🔵 - Smoldapp *******************************************************************************
	 ** On selecting a new tokenToDisperse token, update the destination object with the new token
	 **********************************************************************************************/
	const onUpdateToken = useCallback(
		(newToken: TToken, newAmount: TNormalizedBN | undefined): void => {
			dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: newToken});
			dispatchConfiguration({type: 'SET_AMOUNT_TO_SEND', payload: newAmount});
		},
		[dispatchConfiguration]
	);

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(possibleTokenToReceive)) {
			if (getBalance(dest.address).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokenToReceive, getBalance]);

	const onConfirm = useCallback((): void => {
		set_currentStep(Step.SUMMARY);
		document?.getElementById('summary')?.scrollIntoView({behavior: 'smooth', block: 'center'});
	}, [set_currentStep]);

	const canContinue = useMemo((): boolean => {
		return !(
			//Check on receiver
			(
				!isValidTokenToReceive ||
				!configuration.receiver ||
				configuration.receiver.address === zeroAddress ||
				//Check on tokenToSend
				!configuration.tokenToSend ||
				configuration.tokenToSend.address === zeroAddress ||
				//Check on amountToSend
				!configuration.amountToSend ||
				configuration.amountToSend.raw === 0n ||
				getBalance(configuration.tokenToSend.address).raw < configuration.amountToSend.raw ||
				//Check on vestingStartDate and vestingEndDate
				!configuration.vestingStartDate ||
				!configuration.vestingEndDate ||
				isAfter(configuration.vestingStartDate, configuration.vestingEndDate)
			)
		);
	}, [
		configuration.amountToSend,
		configuration.receiver,
		configuration.tokenToSend,
		configuration.vestingEndDate,
		configuration.vestingStartDate,
		getBalance,
		isValidTokenToReceive
	]);
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
						<b>{'Pls configure your vesting contract?'}</b>
						<p className={'text-sm text-neutral-500'}>{'Yeah, boring, but go you'}</p>
					</div>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={cl('mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4')}>
						<div className={'col-span-12 flex w-full flex-col'}>
							<small className={'pb-1 pl-1'}>{'Beneficiary'}</small>
							<AddressInput
								value={configuration.receiver}
								onChangeValue={e => dispatchConfiguration({type: 'SET_RECEIVER', payload: e})}
							/>
						</div>

						<div className={'col-span-12 mt-4 flex w-full flex-col'}>
							<small className={'pb-1 pl-1'}>{'Token'}</small>
							<TokenInput
								index={0}
								token={configuration.tokenToSend}
								tokens={filteredBalances}
								onChangeToken={(newToken, newAmount) => onUpdateToken(newToken, newAmount)}
								value={configuration.amountToSend}
								onChange={(v: TNormalizedBN | undefined) =>
									dispatchConfiguration({type: 'SET_AMOUNT_TO_SEND', payload: v})
								}
							/>
						</div>

						<div className={'col-span-12 mt-4 flex w-full flex-col'}>
							<div className={'flex w-full gap-2'}>
								<div className={'flex w-full flex-col'}>
									<small className={'pb-1 pl-1'}>{'Start Date'}</small>
								</div>
								<div className={'flex h-full'}>
									<IconChevronPlain className={'invisible h-4 w-4'} />
								</div>
								<div className={'flex w-full flex-col'}>
									<small className={'pb-1 pl-1'}>{'End Date'}</small>
								</div>
							</div>

							<div className={'flex w-full gap-2'}>
								<div className={'flex w-full'}>
									<DatePicker
										date={configuration.vestingStartDate}
										onChangeDate={(newStart: Date | undefined) => {
											dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: newStart});
										}}
									/>
								</div>
								<div className={'flex items-center'}>
									<IconChevronPlain className={'h-4 w-4 -rotate-90 text-neutral-900/30'} />
								</div>
								<div className={'flex w-full'}>
									<DatePicker
										date={configuration.vestingEndDate}
										startDate={configuration.vestingStartDate}
										onChangeDate={(newEndDate: Date | undefined) =>
											dispatchConfiguration({
												type: 'SET_VESTING_END_DATE',
												payload: newEndDate
											})
										}
									/>
								</div>
							</div>
						</div>

						<div className={'col-span-12 mt-4 flex w-full flex-col'}>
							<Button
								onClick={onConfirm}
								isDisabled={!canContinue}>
								{'Continue'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ViewVestingConfiguration;
