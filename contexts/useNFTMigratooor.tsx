import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TOpenSeaAsset} from 'utils/types/opensea';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';

export enum	Step {
	WALLET = 'wallet',
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TSelected = {
	selected: TOpenSeaAsset[],
	destinationAddress: TAddress,
	currentStep: Step,
	set_selected: Dispatch<SetStateAction<TOpenSeaAsset[]>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_currentStep: Dispatch<SetStateAction<Step>>
}
const	defaultProps: TSelected = {
	selected: [],
	destinationAddress: toAddress(),
	currentStep: Step.WALLET,
	set_selected: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_currentStep: (): void => undefined
};

const	NFTMigratooorContext = createContext<TSelected>(defaultProps);
export const NFTMigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{address, isActive, walletType} = useWeb3();
	const	[destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const	[selected, set_selected] = useState<TOpenSeaAsset[]>([]);
	const	[currentStep, set_currentStep] = useState<Step>(Step.WALLET);

	useUpdateEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected([]);
				set_destinationAddress(toAddress());
			});
		}
	}, [isActive]);

	useEffect((): void => {
		const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.DESTINATION);
		} else if (!isActive || !address) {
			set_currentStep(Step.WALLET);
		}
	}, [address, isActive, walletType]);

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
				document?.getElementById('approvals')?.scrollIntoView({behavior: 'smooth', block: 'start'});
			}
		}, 0);
	});

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
				currentStepContainer = document?.getElementById('approvals');
			}
			const	currentElementHeight = currentStepContainer?.offsetHeight;
			if (scalooor?.style) {
				scalooor.style.height = `calc(100vh - ${currentElementHeight}px - ${headerHeight}px + 16px)`;
			}
			currentStepContainer?.scrollIntoView({behavior: 'smooth', block: 'start'});
		}, 100);
	}, [currentStep, walletType]);

	const	contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		destinationAddress,
		set_destinationAddress,
		currentStep,
		set_currentStep
	}), [selected, destinationAddress, currentStep]);

	return (
		<NFTMigratooorContext.Provider value={contextValue}>
			<div id={'NFTMiratooorView'} className={'mx-auto w-full overflow-hidden'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</NFTMigratooorContext.Provider>
	);
};


export const useNFTMigratooor = (): TSelected => useContext(NFTMigratooorContext);
