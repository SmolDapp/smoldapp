import React, {Fragment, useCallback, useMemo, useState} from 'react';
import Link from 'next/link';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {addMonths, addYears, isAfter} from 'date-fns';
import {zeroAddress} from 'viem';
import IconInfo from '@icons/IconInfo';
import {useDeepCompareEffect, useDeepCompareMemo, useIsMounted, useUpdateEffect} from '@react-hookz/web';
import {Step, useStream} from '@stream/useStream';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {type TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import AddressInput from '@common/AddressInput';
import {PopoverSettings} from '@common/PopoverSettings';
import {PopoverSettingsItemExpert} from '@common/PopoverSettings.item.expert';
import {PopoverSettingsItemTokenList} from '@common/PopoverSettings.item.tokenlist';
import {DatePicker} from '@common/Primitives/DatePicker';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@common/Primitives/Tooltip';
import TokenInput from '@common/TokenInput';
import ViewSectionHeading from '@common/ViewSectionHeading';

import {getDefaultVestingContract} from './constants';
import {TemplateButton} from './TemplateButton';

import type {ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

function StreamCustomizedDates(): ReactElement {
	const {configuration, dispatchConfiguration} = useStream();

	return (
		<Fragment>
			<div className={'col-span-12 mt-0 flex w-full flex-col'}>
				<div className={'flex w-full flex-col'}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger className={'flex w-fit items-center gap-1 pb-1'}>
								<small className={'text-left'}>{'Start Date'}</small>
								<IconInfo className={'h-3 w-3 text-neutral-900/30'} />
							</TooltipTrigger>
							<TooltipContent>
								<p className={'max-w-xs whitespace-break-spaces text-center'}>
									{'Select the date and time for your stream to begin.'}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className={'flex w-full'}>
					<DatePicker
						date={configuration.vestingStartDate}
						onChangeDate={(newStart: Date | undefined) => {
							dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: newStart});
						}}
					/>
				</div>
			</div>

			<div className={'col-span-12 mt-0 flex w-full flex-col'}>
				<div className={'flex w-full flex-col'}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger className={'flex w-fit items-center gap-1 pb-1'}>
								<small className={'text-left'}>{'End Date'}</small>
								<IconInfo className={'h-3 w-3 text-neutral-900/30'} />
							</TooltipTrigger>
							<TooltipContent>
								<p className={'max-w-xs whitespace-break-spaces text-center'}>
									{
										'Select the date and time for your stream to end (with 100% of the tokens being streamed out by that date).'
									}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
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

			<div className={'col-span-12 mt-0 flex w-full flex-col'}>
				<div className={'flex w-full flex-col'}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger className={'flex w-fit items-center gap-1 pb-1'}>
								<small className={'text-left'}>{'Cliff End'}</small>
								<IconInfo className={'h-3 w-3 text-neutral-900/30'} />
							</TooltipTrigger>
							<TooltipContent>
								<p className={'max-w-xs whitespace-break-spaces text-center'}>
									{'Set a cliff date, before which the recipient cannot claim their tokens.'}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className={'flex w-full'}>
					<DatePicker
						date={configuration.cliffEndDate}
						onChangeDate={(newEndDate: Date | undefined) =>
							dispatchConfiguration({
								type: 'SET_CLIFF_END_DATE',
								payload: newEndDate
							})
						}
					/>
				</div>
			</div>
		</Fragment>
	);
}

function StreamTemplateView(): ReactElement {
	const [selectedTemplate, set_selectedTemplate] = useState(-1);
	const {dispatchConfiguration} = useStream();

	return (
		<div className={'col-span-12 flex w-full flex-col'}>
			<small className={'pb-1'}>{'Configuration'}</small>
			<div className={'col-span-12 grid grid-cols-1 gap-4 md:grid-cols-3'}>
				<TemplateButton
					title={'The Basic'}
					description={'• 1 month vesting\n• No cliff\n• Starting now'}
					isSelected={selectedTemplate === 0}
					onSelect={(): void => {
						set_selectedTemplate(0);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: undefined});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addMonths(new Date(), 1)});
					}}
				/>
				<TemplateButton
					title={'yBudget'}
					description={'• 3 months vesting\n• No cliff\n• Starting now'}
					isSelected={selectedTemplate === 1}
					onSelect={(): void => {
						set_selectedTemplate(1);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: undefined});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addMonths(new Date(), 3)});
					}}
				/>
				<TemplateButton
					title={'Off the Cliff'}
					description={'• 3 years vesting\n• No cliff\n• Starting now'}
					isSelected={selectedTemplate === 2}
					onSelect={(): void => {
						set_selectedTemplate(2);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: undefined});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addYears(new Date(), 3)});
					}}
				/>
				<TemplateButton
					title={'See-ya-next-year'}
					description={'• 1 year vesting\n• 3 month cliff\n• Starting now'}
					isSelected={selectedTemplate === 3}
					onSelect={(): void => {
						set_selectedTemplate(3);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: addMonths(new Date(), 3)});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addYears(new Date(), 1)});
					}}
				/>
				<TemplateButton
					title={'S&P 500'}
					description={'• 4 year vesting\n• 6 month cliff\n• Starting now'}
					isSelected={selectedTemplate === 4}
					onSelect={(): void => {
						set_selectedTemplate(4);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: addMonths(new Date(), 6)});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addYears(new Date(), 4)});
					}}
				/>
				<TemplateButton
					title={'Customize'}
					description={'Your own rules, to rule them all'}
					isSelected={selectedTemplate === 5}
					onSelect={(): void => {
						set_selectedTemplate(5);
					}}
				/>
			</div>
			<div className={'mt-4 grid gap-4'}>{selectedTemplate === 5 ? <StreamCustomizedDates /> : null}</div>
		</div>
	);
}

function TokenSelector(props: {onChangeTokenToReceiveValidity: (v: boolean | 'undetermined') => void}): ReactElement {
	const {configuration, dispatchConfiguration} = useStream();
	const {safeChainID} = useChainID();
	const {getBalance} = useWallet();
	const [possibleTokenToReceive, set_possibleTokenToReceive] = useState<TDict<TToken>>({});
	const {tokenList} = useTokenList();

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
		props.onChangeTokenToReceiveValidity('undetermined');
		if (!isZeroAddress(configuration.tokenToSend?.address)) {
			props.onChangeTokenToReceiveValidity(true);
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
				if (dest.address === ETH_TOKEN_ADDRESS) {
					continue;
				}
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokenToReceive, getBalance]);

	return (
		<div className={'col-span-12 flex w-full flex-col'}>
			<small className={'pb-1'}>{'Token'}</small>
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
	);
}

function ViewStreamConfiguration(): ReactElement {
	const isMounted = useIsMounted();
	const {configuration, dispatchConfiguration, set_currentStep} = useStream();
	const {getBalance} = useWallet();
	const {chainID} = useChainID();
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const [shouldUseExpertMode, set_shouldUseExpertMode] = useState(false);

	const currentVestingContract = useMemo((): TAddress | undefined => {
		return getDefaultVestingContract(chainID);
	}, [chainID]);

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

	if (!currentVestingContract && isMounted()) {
		return (
			<section>
				<div className={'box-0 grid w-full grid-cols-12'}>
					<ViewSectionHeading
						title={`SmolStream isn’t on ${getNetwork(chainID).name}… yet.`}
						content={'To make the devs work harder, click the button below to shame us on X.'}
					/>
					<div className={'relative col-span-12 flex flex-col p-4 pt-0 text-neutral-900 md:p-6 md:pt-0'}>
						<div>
							<Link
								href={`https://twitter.com/intent/tweet?text=${`Hey @smoldapp devs! Pls can you add ${
									getNetwork(chainID).name
								} to SmolStream? You are so handsome, sexy and talented. I’m sure you can do it!`}`}>
								<Button>{'I want to talk to the manager!'}</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'Configure your stream.'}
					content={
						'Select the recipient, token, amount and dates and your stream will be ready to start streaming.\nThere are some common templates to help you out, or select customize to set your own rules.'
					}
					className={'!pb-0'}
					configSection={
						<PopoverSettings>
							<PopoverSettingsItemTokenList />
							<PopoverSettingsItemExpert
								isSelected={shouldUseExpertMode}
								onChange={set_shouldUseExpertMode}
							/>
						</PopoverSettings>
					}
				/>
				<div className={'relative col-span-12 flex flex-col p-4 pt-0 text-neutral-900 md:p-6 md:pt-0'}>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={cl('mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4')}>
						<div className={'col-span-12 flex w-full flex-col'}>
							<small className={'pb-1'}>{'Beneficiary'}</small>
							<AddressInput
								value={configuration.receiver}
								onChangeValue={e => dispatchConfiguration({type: 'SET_RECEIVER', payload: e})}
							/>
						</div>

						<TokenSelector onChangeTokenToReceiveValidity={set_isValidTokenToReceive} />

						<StreamTemplateView />

						<div className={'col-span-12 mt-0 flex w-full flex-col'}>
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

export default ViewStreamConfiguration;
