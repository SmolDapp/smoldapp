import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

export enum	Step {
	WALLET = 'wallet',
	BOOK = 'book',
	CONFIRMATION = 'confirmation'
}

export type TCategory = {value: number; label: string;};
export type TAddressBookElement = {
	UUID: string;
	address: TAddress;
	label: string | undefined;
	description: string | undefined;
	categories: TCategory[];
	chainsID: number[];
	walletKind: 'EOA' | 'SWC';
	isFavorite: boolean;
};

export type TSelected = {
	addressBook: TAddressBookElement[],
	currentStep: Step,
	set_addressBook: Dispatch<SetStateAction<TAddressBookElement[]>>,
	set_currentStep: Dispatch<SetStateAction<Step>>
}
const defaultProps: TSelected = {
	addressBook: [],
	currentStep: Step.WALLET,
	set_addressBook: (): void => undefined,
	set_currentStep: (): void => undefined
};

const AddressBookContext = createContext<TSelected>(defaultProps);
export const AddressBookContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletLedger, isWalletSafe} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);
	const [addressBook, set_addressBook] = useState<TAddressBookElement[]>([]);

	/**********************************************************************************************
	** This effect is used to directly jump the UI to the FLOW section if the wallet is
	** already connected or if the wallet is a special wallet type (e.g. EMBED_LEDGER).
	** If the wallet is not connected, jump to the WALLET section to connect.
	**********************************************************************************************/
	useEffect((): void => {
		const isEmbedWallet = isWalletLedger || isWalletSafe;
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.BOOK);
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
			} else if (currentStep === Step.BOOK || isEmbedWallet) {
				document?.getElementById('book')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			} else if (currentStep === Step.CONFIRMATION) {
				document?.getElementById('confirmation')?.scrollIntoView({behavior: 'smooth', block: 'start'});
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
			} else if (currentStep === Step.BOOK || isEmbedWallet) {
				currentStepContainer = document?.getElementById('book');
			} else if (currentStep === Step.CONFIRMATION) {
				currentStepContainer = document?.getElementById('confirmation');
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
		addressBook,
		set_addressBook,
		currentStep,
		set_currentStep
	}), [currentStep, addressBook]);

	return (
		<AddressBookContext.Provider value={contextValue}>
			<div className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</AddressBookContext.Provider>
	);
};

export const useAddressBook = (): TSelected => useContext(AddressBookContext);
