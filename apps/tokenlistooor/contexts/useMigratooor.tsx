import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export enum	Step {
	WALLET = 'wallet',
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TSelected = {
	selected: TAddress[],
	amounts: TDict<TNormalizedBN>,
	destinationAddress: TAddress,
	shouldDonateETH: boolean,
	amountToDonate: TNormalizedBN,
	currentStep: Step,
	set_selected: Dispatch<SetStateAction<TAddress[]>>,
	set_amounts: Dispatch<SetStateAction<TDict<TNormalizedBN>>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_shouldDonateETH: Dispatch<SetStateAction<boolean>>,
	set_amountToDonate: Dispatch<SetStateAction<TNormalizedBN>>,
	set_currentStep: Dispatch<SetStateAction<Step>>
}
const	defaultProps: TSelected = {
	selected: [],
	amounts: {},
	destinationAddress: toAddress(),
	shouldDonateETH: false,
	amountToDonate: toNormalizedBN(0),
	currentStep: Step.WALLET,
	set_selected: (): void => undefined,
	set_amounts: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_shouldDonateETH: (): void => undefined,
	set_amountToDonate: (): void => undefined,
	set_currentStep: (): void => undefined
};

function scrollToTargetAdjusted(element: HTMLElement): void {
	const headerOffset = 81 - 16;
	if (!element) {
		return;
	}
	const elementPosition = element.getBoundingClientRect().top;
	const offsetPosition = elementPosition + window.scrollY - headerOffset;
	window.scrollTo({
		top: Math.round(offsetPosition),
		behavior: 'smooth'
	});
}

const	MigratooorContext = createContext<TSelected>(defaultProps);
export const MigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{address, isActive, walletType} = useWeb3();
	const	[destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const	[selected, set_selected] = useState<TAddress[]>([]);
	const	[amounts, set_amounts] = useState<TDict<TNormalizedBN>>({});
	const	[shouldDonateETH, set_shouldDonateETH] = useState(false);
	const	[amountToDonate, set_amountToDonate] = useState(toNormalizedBN(0));
	const	[currentStep, set_currentStep] = useState<Step>(Step.WALLET);

	useUpdateEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected([]);
				set_amounts({});
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
		const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.DESTINATION);
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
			const	isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
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
			const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
			const scalooor = document?.getElementById('scalooor');
			const headerHeight = 96;

			if (currentStep === Step.WALLET && !isEmbedWallet) {
				currentStepContainer = document?.getElementById('wallet');
			} else if (currentStep === Step.DESTINATION || isEmbedWallet) {
				currentStepContainer = document?.getElementById('destination');
			} else if (currentStep === Step.SELECTOR) {
				currentStepContainer = document?.getElementById('selector');
			} else if (currentStep === Step.CONFIRMATION) {
				currentStepContainer = document?.getElementById('tldr');
			}
			const	currentElementHeight = currentStepContainer?.offsetHeight;
			if (scalooor?.style) {
				scalooor.style.height = `calc(100vh - ${currentElementHeight}px - ${headerHeight}px + 36px)`;
			}
			if (currentStepContainer) {
				scrollToTargetAdjusted(currentStepContainer);
			}
		}, 0);
	}, [currentStep, walletType]);

	const	contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		amounts,
		set_amounts,
		destinationAddress,
		set_destinationAddress,
		shouldDonateETH,
		set_shouldDonateETH,
		amountToDonate,
		set_amountToDonate,
		currentStep,
		set_currentStep
	}), [selected, amounts, destinationAddress, shouldDonateETH, amountToDonate, currentStep]);

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
