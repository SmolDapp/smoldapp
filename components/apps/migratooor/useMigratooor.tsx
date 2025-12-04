import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export enum Step {
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TSelectedStatus = 'pending' | 'success' | 'error' | 'none';
export type TSelectedElement = {
	address: TAddress;
	symbol: string;
	decimals: number;
	amount: TNormalizedBN;
	status: TSelectedStatus;
	isSelected: boolean;
};

export type TSelected = {
	selected: TDict<TSelectedElement>;
	destinationAddress: TAddress;
	currentStep: Step;
	set_selected: Dispatch<SetStateAction<TDict<TSelectedElement>>>;
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>;
	set_currentStep: Dispatch<SetStateAction<Step>>;
};
const defaultProps: TSelected = {
	selected: {},
	destinationAddress: toAddress(),
	currentStep: Step.DESTINATION,
	set_selected: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_currentStep: (): void => undefined
};

const MigratooorContext = createContext<TSelected>(defaultProps);
export const MigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe, onConnect} = useWeb3();
	const [destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const [selected, set_selected] = useState(defaultProps.selected);
	const [currentStep, set_currentStep] = useState<Step>(Step.DESTINATION);

	useUpdateEffect((): void => {
		if (!isActive) {
			set_selected(defaultProps.selected);
			set_destinationAddress(toAddress());
		}
	}, [isActive]);

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

			if (currentStep === Step.DESTINATION) {
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

	const contextValue = useMemo(
		(): TSelected => ({
			selected,
			set_selected,
			destinationAddress,
			set_destinationAddress,
			currentStep,
			set_currentStep
		}),
		[selected, destinationAddress, currentStep]
	);

	return (
		<MigratooorContext.Provider value={contextValue}>
			<div
				id={'MiratooorView'}
				className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</MigratooorContext.Provider>
	);
};

export const useMigratooor = (): TSelected => useContext(MigratooorContext);
