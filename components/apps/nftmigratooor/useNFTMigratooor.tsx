import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {alchemyToNFT, fetchAllAssetsFromAlchemy, fetchAllAssetsFromOpenSea, openseaToNFT} from 'utils/types/opensea';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TNFT} from 'utils/types/nftMigratooor';
import type {TAlchemyAssets} from 'utils/types/opensea';
import type {TAddress, TNDict} from '@yearn-finance/web-lib/types';

export enum	Step {
	WALLET = 'wallet',
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export const NFTMIGRATOOOR_CONTRACT_PER_CHAIN: TNDict<TAddress> = {
	1: toAddress('0x100CCFF9117E168158a6BE35081694fBbe394fBB'),
	10: toAddress('0x6dfd3a052bb73e609d9c2381dc48de5e2662575e'),
	100: toAddress('0xC813978A4c104250B1d2bC198cC7bE74b68Cd81b'),
	137: toAddress('0x0e5b46E4b2a05fd53F5a4cD974eb98a9a613bcb7'),
	250: toAddress('0x291F9794fFB8Cd1F71CE5478E40b5E29a029dbE9'),
	1101: toAddress('0xA3a3C48F1d5191968D3dEF7A5aE4c860589Bf380'),
	42161: toAddress('0x7E08735690028cdF3D81e7165493F1C34065AbA2')
};

export type TSelected = {
	nfts: TNFT[],
	selected: TNFT[],
	destinationAddress: TAddress,
	currentStep: Step,
	set_nfts: Dispatch<SetStateAction<TNFT[]>>,
	set_selected: Dispatch<SetStateAction<TNFT[]>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_currentStep: Dispatch<SetStateAction<Step>>
}
const defaultProps: TSelected = {
	nfts: [],
	selected: [],
	destinationAddress: toAddress(),
	currentStep: Step.WALLET,
	set_nfts: (): void => undefined,
	set_selected: (): void => undefined,
	set_destinationAddress: (): void => undefined,
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

const NFTMigratooorContext = createContext<TSelected>(defaultProps);
export const NFTMigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	// const detectedNFTs = useNFTs();
	const {address, isActive, walletType} = useWeb3();
	const {safeChainID} = useChainID();
	const [destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const [nfts, set_nfts] = useState<TNFT[]>([]);
	const [selected, set_selected] = useState<TNFT[]>([]);
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);

	const handleOpenSeaAssets = useCallback(async (): Promise<void> => {
		if (!address) {
			return set_nfts([]);
		}
		const rawAssets = await fetchAllAssetsFromOpenSea(address);
		const assets = rawAssets.map(openseaToNFT);
		set_nfts(assets);
	}, [address]);

	const handleAlchemyAssets = useCallback(async (): Promise<void> => {
		if (!address) {
			return set_nfts([]);
		}
		const rawAssets = await fetchAllAssetsFromAlchemy(safeChainID, address);
		const assets = (rawAssets || [])
			.filter((asset: TAlchemyAssets): boolean => (
				asset?.title !== ''
				&& asset?.contractMetadata?.name !== ''
				&& asset?.media !== null
				&& asset?.tokenUri !== null
			))
			.map(alchemyToNFT);
		set_nfts(assets);
	}, [safeChainID, address]);
	/**********************************************************************************************
	** Fetch all NFTs from OpenSea. The OpenSea API only returns 200 NFTs at a time, so we need to
	** recursively fetch all NFTs from OpenSea if a cursor for next page is returned.
	** If no address is available, set NFTs to empty array.
	**********************************************************************************************/
	useEffect((): void => {
		if (safeChainID === 1) {
			handleOpenSeaAssets();
		} else {
			handleAlchemyAssets();
		}
	}, [handleOpenSeaAssets, handleAlchemyAssets, safeChainID]);

	/**********************************************************************************************
	** On disconnect, reset all state.
	**********************************************************************************************/
	useUpdateEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected([]);
				set_nfts([]);
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
			const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
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
				currentStepContainer = document?.getElementById('approvals');
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

	/**********************************************************************************************
	** For some small performance improvements, we memoize the context value.
	**********************************************************************************************/
	const contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		nfts,
		set_nfts,
		destinationAddress,
		set_destinationAddress,
		currentStep,
		set_currentStep
	}), [selected, nfts, destinationAddress, currentStep]);

	return (
		<NFTMigratooorContext.Provider value={contextValue}>
			<div id={'NFTMiratooorView'} className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</NFTMigratooorContext.Provider>
	);
};


export const useNFTMigratooor = (): TSelected => useContext(NFTMigratooorContext);
