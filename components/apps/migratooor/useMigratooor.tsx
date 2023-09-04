import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export enum	Step {
	WALLET = 'wallet',
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TSelectedStatus = 'pending' | 'success' | 'error' | 'none';
export type TSelectedElement = {
	address: TAddress,
	symbol: string,
	decimals: number,
	amount: TNormalizedBN,
	status: TSelectedStatus,
	isSelected: boolean
};

export type TSelected = {
	selected: TDict<TSelectedElement>,
	destinationAddress: TAddress,
	currentStep: Step,
	set_selected: Dispatch<SetStateAction<TDict<TSelectedElement>>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_currentStep: Dispatch<SetStateAction<Step>>
}
const defaultProps: TSelected = {
	selected: {},
	destinationAddress: toAddress(),
	currentStep: Step.WALLET,
	set_selected: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_currentStep: (): void => undefined
};

const MigratooorContext = createContext<TSelected>(defaultProps);
export const MigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe} = useWeb3();
	const [destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const [selected, set_selected] = useState(defaultProps.selected);
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);

	useUpdateEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected(defaultProps.selected);
				set_destinationAddress(toAddress());
			});
		}
	}, [isActive]);

	/**********************************************************************************************
	** This effect is used to directly jump the UI to the DESTINATION section if the wallet is
	** already connected or if the wallet is a special wallet type (e.g. EMBED_LEDGER).
	** If the wallet is not connected, jump to the WALLET section to connect.
	**********************************************************************************************/
	useEffect((): void => {
		const isEmbedWallet = isWalletLedger || isWalletSafe;
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.DESTINATION);
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
			} else if (currentStep === Step.DESTINATION || isEmbedWallet) {
				document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.SELECTOR) {
				document?.getElementById('selector')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.CONFIRMATION) {
				document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'start'});
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
			} else if (currentStep === Step.DESTINATION || isEmbedWallet) {
				currentStepContainer = document?.getElementById('destination');
			} else if (currentStep === Step.SELECTOR) {
				currentStepContainer = document?.getElementById('selector');
			} else if (currentStep === Step.CONFIRMATION) {
				currentStepContainer = document?.getElementById('tldr');
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

	const contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		destinationAddress,
		set_destinationAddress,
		currentStep,
		set_currentStep
	}), [selected, destinationAddress, currentStep]);

	return (
		<MigratooorContext.Provider value={contextValue}>
			<div id={'MiratooorView'} className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</MigratooorContext.Provider>
	);
};


export const useMigratooor = (): TSelected => useContext(MigratooorContext);
