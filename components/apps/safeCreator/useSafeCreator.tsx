import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {coingeckoGasCoinIDs} from 'utils/constants';
import useSWR from 'swr';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export enum	Step {
	WALLET = 'wallet',
	FLOW = 'flow',
	FLOW_DATA = 'flowData',
	NEW_DEPLOY = 'newDeploy'
}

export type TDisperseElement = {address: TAddress | undefined, label: string, amount: TNormalizedBN | undefined, UUID: string};
export type TPriceFromGecko = TDict<{usd: number}>;

export type TSelected = {
	currentStep: Step,
	selectedFlow: 'NONE' | 'EXISTING' | 'NEW',
	set_currentStep: Dispatch<SetStateAction<Step>>
	set_selectedFlow: Dispatch<SetStateAction<'NONE' | 'EXISTING' | 'NEW'>>
	chainCoinPrices: TPriceFromGecko
}
const defaultProps: TSelected = {
	currentStep: Step.WALLET,
	selectedFlow: 'NONE',
	set_currentStep: (): void => undefined,
	set_selectedFlow: (): void => undefined,
	chainCoinPrices: {}
};

const SafeCreatorContext = createContext<TSelected>(defaultProps);
export const SafeCreatorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, walletType} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);
	const [selectedFlow, set_selectedFlow] = useState<'NONE' | 'EXISTING' | 'NEW'>('NONE');
	const {data: chainCoinPrices} = useSWR<TPriceFromGecko>(
		`https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(coingeckoGasCoinIDs)}&vs_currencies=usd`,
		baseFetcher,
		{refreshInterval: 10_000}
	);

	/**********************************************************************************************
	** This effect is used to directly jump the UI to the FLOW section if the wallet is
	** already connected or if the wallet is a special wallet type (e.g. EMBED_LEDGER).
	** If the wallet is not connected, jump to the WALLET section to connect.
	**********************************************************************************************/
	useEffect((): void => {
		const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.FLOW);
		} else if (!isActive || !address) {
			set_currentStep(Step.WALLET);
		}
	}, [address, isActive, walletType]);

	/**********************************************************************************************
	** This effect is used to handle some UI transitions and sections jumps. Once the current step
	** changes, we need to scroll to the correct section.
	** This effect is triggered only on mount to set the initial scroll position.
	**********************************************************************************************/
	useMountEffect((): void => {
		setTimeout((): void => {
			const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
			if (currentStep === Step.WALLET && !isEmbedWallet) {
				document?.getElementById('wallet')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.FLOW || isEmbedWallet) {
				document?.getElementById('flow')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.FLOW_DATA) {
				document?.getElementById('flowData')?.scrollIntoView({behavior: 'smooth', block: 'start'});
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
			const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
			const scalooor = document?.getElementById('scalooor');
			const headerHeight = 96;

			if (currentStep === Step.WALLET && !isEmbedWallet) {
				currentStepContainer = document?.getElementById('wallet');
			} else if (currentStep === Step.FLOW || isEmbedWallet) {
				currentStepContainer = document?.getElementById('flow');
			} else if (currentStep === Step.FLOW_DATA) {
				currentStepContainer = document?.getElementById('flowData');
			} else if (currentStep === Step.NEW_DEPLOY) {
				currentStepContainer = document?.getElementById('newDeploy');
			}
			const currentElementHeight = currentStepContainer?.offsetHeight;
			if (scalooor?.style) {
				scalooor.style.height = `calc(100vh - ${currentElementHeight}px - ${headerHeight}px + 36px)`;
			}
			if (currentStepContainer) {
				scrollToTargetAdjusted(currentStepContainer);
			}
		}, 0);
	}, [currentStep, walletType]);

	const contextValue = useMemo((): TSelected => ({
		currentStep,
		selectedFlow,
		set_selectedFlow,
		set_currentStep,
		chainCoinPrices: chainCoinPrices || {}
	}), [currentStep, selectedFlow, chainCoinPrices]);

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
