import React, {createContext, useContext, useEffect, useMemo, useReducer, useState} from 'react';
import {isBefore} from 'date-fns';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {defaultInputAddressLike, type TInputAddressLike} from '@common/AddressInput';

import {useUserVesting} from './useUserVestings';

import type {Dispatch, SetStateAction} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

export enum Step {
	WALLET = 'wallet',
	CONFIGURATION = 'configuration',
	SUMMARY = 'summary',
	NEW_DEPLOY = 'newDeploy'
}

type TVestingConfiguration = {
	tokenToSend: TToken | undefined;
	amountToSend: TNormalizedBN | undefined;
	receiver: TInputAddressLike;
	vestingStartDate: Date | undefined;
	vestingEndDate: Date | undefined;
	cliffEndDate: Date | undefined;
};

export type TVesting = {
	currentStep: Step;
	set_currentStep: Dispatch<SetStateAction<Step>>;
	configuration: TVestingConfiguration;
	dispatchConfiguration: Dispatch<
		| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
		| {type: 'SET_AMOUNT_TO_SEND'; payload: TNormalizedBN | undefined}
		| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
		| {type: 'SET_VESTING_START_DATE'; payload: Date | undefined}
		| {type: 'SET_VESTING_END_DATE'; payload: Date | undefined}
		| {type: 'SET_CLIFF_END_DATE'; payload: Date | undefined}
	>;
};
const defaultProps: TVesting = {
	currentStep: Step.WALLET,
	set_currentStep: (): void => undefined,
	dispatchConfiguration: (): void => undefined,
	configuration: {
		tokenToSend: undefined,
		amountToSend: undefined,
		receiver: defaultInputAddressLike,
		vestingStartDate: new Date(),
		vestingEndDate: new Date(),
		cliffEndDate: new Date()
	}
};

const VestingContext = createContext<TVesting>(defaultProps);
export const VestingContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);

	useUserVesting();

	/**********************************************************************************************
	 ** This effect is used to directly jump the UI to the CONFIGURATION section if the wallet is
	 ** already connected or if the wallet is a special wallet type (e.g. EMBED_LEDGER).
	 ** If the wallet is not connected, jump to the WALLET section to connect.
	 **********************************************************************************************/
	useEffect((): void => {
		const isEmbedWallet = isWalletLedger || isWalletSafe;
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.CONFIGURATION);
		} else if (!isActive || !address) {
			set_currentStep(Step.WALLET);
		}
	}, [address, isActive, isWalletLedger, isWalletSafe]);

	/**********************************************************************************************
	 ** This effect is used to handle some UI transitions and sections jumps. Once the current step
	 ** changes, we need to scroll to the correct section.
	 ** This effect is triggered only on mount to set the initial scroll position.
	 **********************************************************************************************/
	useMountEffect((): void => {
		setTimeout((): void => {
			const isEmbedWallet = isWalletLedger || isWalletSafe;
			if (currentStep === Step.WALLET && !isEmbedWallet) {
				document?.getElementById('wallet')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.CONFIGURATION || isEmbedWallet) {
				document?.getElementById('configuration')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.SUMMARY) {
				document?.getElementById('summary')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.NEW_DEPLOY) {
				document?.getElementById('newDeploy')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			}
		}, 0);
	});

	/**********************************************************************************************
	 ** This effect is used to handle some UI transitions and sections jumps. Once the current step
	 ** changes, we need to scroll to the correct section.
	 ** This effect is ignored on mount but will be triggered on every update to set the correct
	 ** scroll position.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		setTimeout((): void => {
			let currentStepContainer;
			const isEmbedWallet = isWalletLedger || isWalletSafe;
			const scalooor = document?.getElementById('scalooor');

			if (currentStep === Step.WALLET && !isEmbedWallet) {
				currentStepContainer = document?.getElementById('wallet');
			} else if (currentStep === Step.CONFIGURATION || isEmbedWallet) {
				currentStepContainer = document?.getElementById('configuration');
			} else if (currentStep === Step.SUMMARY) {
				currentStepContainer = document?.getElementById('summary');
			} else if (currentStep === Step.NEW_DEPLOY) {
				currentStepContainer = document?.getElementById('newDeploy');
			}
			const currentElementHeight = currentStepContainer?.offsetHeight;
			if (scalooor?.style) {
				scalooor.style.height = `calc(100vh - ${currentElementHeight}px - ${HEADER_HEIGHT}px + 36px)`;
			}
			if (currentStepContainer) {
				scrollToTargetAdjusted(currentStepContainer);
			}
		}, 0);
	}, [currentStep, isWalletLedger, isWalletSafe]);

	const configurationReducer = (
		state: TVestingConfiguration,
		action:
			| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
			| {type: 'SET_AMOUNT_TO_SEND'; payload: TNormalizedBN | undefined}
			| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
			| {type: 'SET_VESTING_START_DATE'; payload: Date | undefined}
			| {type: 'SET_VESTING_END_DATE'; payload: Date | undefined}
			| {type: 'SET_CLIFF_END_DATE'; payload: Date | undefined}
	): TVestingConfiguration => {
		switch (action.type) {
			case 'SET_TOKEN_TO_SEND':
				return {...state, tokenToSend: action.payload};
			case 'SET_AMOUNT_TO_SEND':
				return {...state, amountToSend: action.payload};
			case 'SET_RECEIVER':
				return {...state, receiver: action.payload};
			case 'SET_VESTING_START_DATE':
				if (action.payload && state.vestingEndDate && isBefore(state.vestingEndDate, action.payload)) {
					return {...state, vestingStartDate: action.payload, vestingEndDate: action.payload};
				}
				return {...state, vestingStartDate: action.payload};
			case 'SET_VESTING_END_DATE':
				return {...state, vestingEndDate: action.payload};
			case 'SET_CLIFF_END_DATE':
				if (action.payload && state.vestingEndDate && isBefore(state.vestingEndDate, action.payload)) {
					return {...state, cliffEndDate: action.payload, vestingEndDate: action.payload};
				}
				return {...state, cliffEndDate: action.payload};
		}
	};

	const [configuration, dispatch] = useReducer(configurationReducer, {
		tokenToSend: undefined,
		amountToSend: undefined,
		receiver: defaultInputAddressLike,
		vestingStartDate: undefined,
		vestingEndDate: undefined,
		cliffEndDate: undefined
	});

	const contextValue = useMemo(
		(): TVesting => ({
			currentStep,
			set_currentStep,
			configuration,
			dispatchConfiguration: dispatch
		}),
		[currentStep, configuration]
	);

	return (
		<VestingContext.Provider value={contextValue}>
			<div className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</VestingContext.Provider>
	);
};

export const useVesting = (): TVesting => useContext(VestingContext);
