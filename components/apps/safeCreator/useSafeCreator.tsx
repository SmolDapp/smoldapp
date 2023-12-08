import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {COINGECKO_GAS_COIN_IDS, HEADER_HEIGHT} from 'utils/constants';
import useSWR from 'swr';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export enum Step {
	FLOW = 'flow',
	FLOW_DATA = 'flowData',
	NEW_DEPLOY = 'newDeploy'
}

export type TDisperseElement = {
	address: TAddress | undefined;
	label: string;
	amount: TNormalizedBN | undefined;
	UUID: string;
};
export type TPriceFromGecko = TDict<{usd: number}>;

export type TSelected = {
	currentStep: Step;
	selectedFlow: 'NONE' | 'EXISTING' | 'NEW';
	set_currentStep: Dispatch<SetStateAction<Step>>;
	set_selectedFlow: Dispatch<SetStateAction<'NONE' | 'EXISTING' | 'NEW'>>;
	chainCoinPrices: TPriceFromGecko;
};
const defaultProps: TSelected = {
	currentStep: Step.FLOW,
	selectedFlow: 'NONE',
	set_currentStep: (): void => undefined,
	set_selectedFlow: (): void => undefined,
	chainCoinPrices: {}
};

const SafeCreatorContext = createContext<TSelected>(defaultProps);
export const SafeCreatorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe, onConnect} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.FLOW);
	const [selectedFlow, set_selectedFlow] = useState<'NONE' | 'EXISTING' | 'NEW'>('NONE');
	const {data: chainCoinPrices} = useSWR<TPriceFromGecko>(
		`https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_GAS_COIN_IDS)}&vs_currencies=usd`,
		baseFetcher,
		{refreshInterval: 10_000}
	);

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

			if (currentStep === Step.FLOW) {
				currentStepContainer = document?.getElementById('flow');
			} else if (currentStep === Step.FLOW_DATA) {
				currentStepContainer = document?.getElementById('flowData');
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

	const contextValue = useMemo(
		(): TSelected => ({
			currentStep,
			selectedFlow,
			set_selectedFlow,
			set_currentStep,
			chainCoinPrices: chainCoinPrices || {}
		}),
		[currentStep, selectedFlow, chainCoinPrices]
	);

	return (
		<SafeCreatorContext.Provider value={contextValue}>
			<div className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</SafeCreatorContext.Provider>
	);
};

export const useSafeCreator = (): TSelected => useContext(SafeCreatorContext);
