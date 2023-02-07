import React, {createContext, useContext, useMemo, useState} from 'react';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

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

	useUpdateEffect((): void => {
		if (isActive && address) {
			set_currentStep(Step.DESTINATION);
		} else if (!isActive || !address) {
			set_currentStep(Step.WALLET);
		}
	}, [address, isActive]);

	useMountEffect((): void => {
		setTimeout((): void => {
			if (currentStep === Step.WALLET && walletType !== 'EMBED_LEDGER') {
				document?.getElementById('wallet')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.DESTINATION || walletType === 'EMBED_LEDGER') {
				document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.SELECTOR) {
				document?.getElementById('selector')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			}
		}, 0);
	});

	useUpdateEffect((): void => {
		setTimeout((): void => {
			let currentStepContainer;
			const scalooor = document?.getElementById('scalooor');
			const headerHeight = 96;

			if (currentStep === Step.WALLET && walletType !== 'EMBED_LEDGER') {
				currentStepContainer = document?.getElementById('wallet');
			} else if (currentStep === Step.DESTINATION || walletType === 'EMBED_LEDGER') {
				currentStepContainer = document?.getElementById('destination');
			} else if (currentStep === Step.SELECTOR) {
				currentStepContainer = document?.getElementById('selector');
			}
			const	currentElementHeight = currentStepContainer?.offsetHeight;
			if (scalooor?.style) {
				scalooor.style.height = `calc(100vh - ${currentElementHeight}px - ${headerHeight}px + 16px)`;
			}
			currentStepContainer?.scrollIntoView({behavior: 'smooth', block: 'start'});
		}, 100);
	}, [currentStep]);

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
			<div id={'MiratooorView'} className={'mx-auto w-full overflow-hidden'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</MigratooorContext.Provider>
	);
};


export const useMigratooor = (): TSelected => useContext(MigratooorContext);
