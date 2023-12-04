import React, {useCallback, useMemo, useState} from 'react';
import {Step, useVesting} from 'components/apps/vesting/useVesting';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {addMonths, addYears, isAfter} from 'date-fns';
import {zeroAddress} from 'viem';
import IconChevronPlain from '@icons/IconChevronPlain';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import IconInfo from '@icons/IconInfo';
import {useDeepCompareEffect, useDeepCompareMemo, useUpdateEffect} from '@react-hookz/web';
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
import {ComboboxDemo} from '@common/Primitives/Combobox';
import {DatePicker} from '@common/Primitives/DatePicker';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@common/Primitives/Tooltip';
import TokenInput from '@common/TokenInput';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

function ExpertModeDateView(): ReactElement {
	const {configuration, dispatchConfiguration} = useVesting();

	function renderLabels(): ReactElement {
		return (
			<div className={'flex w-full gap-2'}>
				<div className={'flex w-full flex-col'}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger className={'flex w-fit items-center gap-1 pb-1'}>
								<small className={'text-left'}>{'Start Date'}</small>
								<IconInfo className={'h-3 w-3 text-neutral-900/30'} />
							</TooltipTrigger>
							<TooltipContent>
								<p className={'max-w-xs whitespace-break-spaces text-center'}>
									{
										'This is the date at which the vesting period starts and the beneficiary can start claiming tokens.\n'
									}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className={'flex h-full'}>
					<IconChevronPlain className={'invisible h-4 w-4'} />
				</div>
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
										'This is the date at which the vesting period ends and the beneficiary can claim all the tokens.'
									}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className={'flex h-full'}>
					<IconChevronPlain className={'invisible h-4 w-4'} />
				</div>
				<div className={'flex w-full flex-col'}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger className={'flex w-fit items-center gap-1 pb-1'}>
								<small className={'text-left'}>{'Cliff End'}</small>
								<IconInfo className={'h-3 w-3 text-neutral-900/30'} />
							</TooltipTrigger>
							<TooltipContent>
								<p className={'max-w-xs whitespace-break-spaces text-center'}>
									{
										'Specific period after which the initial portion of the asset becomes fully vested.\n'
									}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		);
	}

	return (
		<div className={'col-span-12 mt-4 flex w-full flex-col'}>
			{renderLabels()}

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
				<div className={'flex items-center'}>
					<p className={'text-neutral-900/30'}>{'⎮'}</p>
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
		</div>
	);
}

function BabyModeTemplateView(): ReactElement {
	const [selectedTemplate, set_selectedTemplate] = useState(-1);
	const {dispatchConfiguration} = useVesting();

	return (
		<div className={'col-span-12 mt-4 flex w-full flex-col'}>
			<small className={'pb-1'}>{'Basic configuration'}</small>
			<div className={'col-span-12 grid grid-cols-3 gap-4'}>
				<ComboboxDemo />
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
					title={'The yBudget'}
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
					title={'The see-ya-next-year'}
					description={'• 1 year vesting\n• 3 month cliff\n• Starting now'}
					isSelected={selectedTemplate === 2}
					onSelect={(): void => {
						set_selectedTemplate(2);
						dispatchConfiguration({type: 'SET_CLIFF_END_DATE', payload: addMonths(new Date(), 3)});
						dispatchConfiguration({type: 'SET_VESTING_START_DATE', payload: new Date()});
						dispatchConfiguration({type: 'SET_VESTING_END_DATE', payload: addYears(new Date(), 1)});
					}}
				/>
			</div>
		</div>
	);
}

function TemplateButton(props: {
	title: string;
	description: string;
	isSelected: boolean;
	onSelect: () => void;
}): ReactElement {
	return (
		<button
			type={'button'}
			className={cl(
				'hover box-0 group relative flex w-full p-2 md:p-4 text-left',
				props.isSelected ? '!bg-primary-50' : ''
			)}
			onClick={props.onSelect}>
			<div>
				<b>{props.title}</b>
				<small className={'whitespace-break-spaces'}>{props.description}</small>
			</div>
			<IconCircleCheck
				className={`absolute right-4 top-4 h-4 w-4 text-[#16a34a] transition-opacity ${
					props.isSelected ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</button>
	);
}

function ViewVestingConfiguration(): ReactElement {
	const {configuration, dispatchConfiguration, set_currentStep} = useVesting();
	const {safeChainID} = useChainID();
	const {getBalance} = useWallet();
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const [possibleTokenToReceive, set_possibleTokenToReceive] = useState<TDict<TToken>>({});
	const {tokenList} = useTokenList();
	const [shouldUseExpertMode, set_shouldUseExpertMode] = useState(false);

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
				<ViewSectionHeading
					title={'We are Draper'}
					content={<span>{'Pls configure your vesting contract? Pls pls pls, so we can proceed'}</span>}
					configSection={
						<PopoverSettings>
							<PopoverSettingsItemTokenList />
							<PopoverSettingsItemExpert
								isSelected={shouldUseExpertMode}
								set_isSelected={set_shouldUseExpertMode}
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

						{shouldUseExpertMode ? <ExpertModeDateView /> : <BabyModeTemplateView />}

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
