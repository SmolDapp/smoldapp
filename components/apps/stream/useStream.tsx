import React, {createContext, useContext, useEffect, useMemo, useReducer, useState} from 'react';
import {isBefore} from 'date-fns';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useUpdateEffect} from '@react-hookz/web';
import {defaultInputAddressLike} from '@utils/tools.address';

import type {Dispatch, SetStateAction} from 'react';
import type {TNormalizedBN, TToken} from '@builtbymom/web3/types';
import type {TInputAddressLike} from '@utils/tools.address';

export enum Step {
	FLOW_SELECTION = 'flow',
	CONFIGURATION = 'configuration',
	SUMMARY = 'summary'
}

type TStreamConfiguration = {
	tokenToSend: TToken | undefined;
	amountToSend: TNormalizedBN | undefined;
	receiver: TInputAddressLike;
	vestingStartDate: Date | undefined;
	vestingEndDate: Date | undefined;
	cliffEndDate: Date | undefined;
};

export type TStream = {
	currentStep: Step;
	set_currentStep: Dispatch<SetStateAction<Step>>;
	currentFlow: 'CHECK' | 'CREATE' | undefined;
	set_currentFlow: Dispatch<SetStateAction<'CHECK' | 'CREATE' | undefined>>;
	configuration: TStreamConfiguration;
	dispatchConfiguration: Dispatch<
		| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
		| {type: 'SET_AMOUNT_TO_SEND'; payload: TNormalizedBN | undefined}
		| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
		| {type: 'SET_VESTING_START_DATE'; payload: Date | undefined}
		| {type: 'SET_VESTING_END_DATE'; payload: Date | undefined}
		| {type: 'SET_CLIFF_END_DATE'; payload: Date | undefined}
		| {type: 'RESET'; payload: undefined}
	>;
};
const defaultProps: TStream = {
	currentStep: Step.FLOW_SELECTION,
	set_currentStep: (): void => undefined,
	currentFlow: undefined,
	set_currentFlow: (): void => undefined,
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

const StreamContext = createContext<TStream>(defaultProps);
export const StreamContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe, onConnect} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.FLOW_SELECTION);
	const [currentFlow, set_currentFlow] = useState<'CHECK' | 'CREATE' | undefined>(undefined);

	/**********************************************************************************************
	 ** This effect is used to directly ask the user to connect its wallet if it's not connected
	 **********************************************************************************************/
	useEffect((): void => {
		if (!isActive && !address) {
			onConnect();
			return;
		}
	}, [address, isActive, onConnect]);

	/**********************************************************************************************
	 ** This effect is used to handle some UI transitions and sections jumps. Once the current step
	 ** changes, we need to scroll to the correct section.
	 ** This effect is ignored on mount but will be triggered on every update to set the correct
	 ** scroll position.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		setTimeout((): void => {
			let currentStepContainer;
			const scalooor = document?.getElementById('scalooor');

			if (currentStep === Step.FLOW_SELECTION) {
				currentStepContainer = document?.getElementById('flow');
			} else if (currentStep === Step.CONFIGURATION) {
				currentStepContainer = document?.getElementById('configuration');
			} else if (currentStep === Step.SUMMARY) {
				currentStepContainer = document?.getElementById('summary');
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
		state: TStreamConfiguration,
		action:
			| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
			| {type: 'SET_AMOUNT_TO_SEND'; payload: TNormalizedBN | undefined}
			| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
			| {type: 'SET_VESTING_START_DATE'; payload: Date | undefined}
			| {type: 'SET_VESTING_END_DATE'; payload: Date | undefined}
			| {type: 'SET_CLIFF_END_DATE'; payload: Date | undefined}
			| {type: 'RESET'; payload: undefined}
	): TStreamConfiguration => {
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
			case 'RESET':
				return defaultProps.configuration;
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
		(): TStream => ({
			currentStep,
			set_currentStep,
			currentFlow,
			set_currentFlow,
			configuration,
			dispatchConfiguration: dispatch
		}),
		[currentStep, currentFlow, configuration]
	);

	return (
		<StreamContext.Provider value={contextValue}>
			<div className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</StreamContext.Provider>
	);
};

export const useStream = (): TStream => useContext(StreamContext);
