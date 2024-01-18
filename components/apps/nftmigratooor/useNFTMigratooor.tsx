import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useNFTs from 'hooks/useNFTs';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {alchemyToNFT, fetchAllAssetsFromAlchemy} from 'utils/types/opensea';
import {isZeroAddress, toAddress} from '@builtbymom/web3/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';

import type {Dispatch, SetStateAction} from 'react';
import type {TNFT} from 'utils/types/nftMigratooor';
import type {TAlchemyAssets} from 'utils/types/opensea';
import type {TAddress} from '@builtbymom/web3/types';

export enum Step {
	DESTINATION = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TSelected = {
	nfts: TNFT[];
	selected: TNFT[];
	destinationAddress: TAddress;
	currentStep: Step;
	isFetchingNFTs: boolean;
	set_nfts: Dispatch<SetStateAction<TNFT[]>>;
	set_selected: Dispatch<SetStateAction<TNFT[]>>;
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>;
	set_currentStep: Dispatch<SetStateAction<Step>>;
};
const defaultProps: TSelected = {
	nfts: [],
	selected: [],
	destinationAddress: toAddress(),
	currentStep: Step.DESTINATION,
	isFetchingNFTs: false,
	set_nfts: (): void => undefined,
	set_selected: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_currentStep: (): void => undefined
};

const NFTMigratooorContext = createContext<TSelected>(defaultProps);
export const NFTMigratooorContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const filterNFTs = useNFTs();
	const {address, isActive, isWalletLedger, isWalletSafe, onConnect} = useWeb3();
	const {safeChainID} = useChainID();
	const [destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const [isFetchingNFTs, set_isFetchingNFTs] = useState(false);
	const [nfts, set_nfts] = useState<TNFT[]>([]);
	const [selected, set_selected] = useState<TNFT[]>([]);
	const [currentStep, set_currentStep] = useState<Step>(Step.DESTINATION);

	const handleAlchemyAssets = useCallback(async (userAddress: TAddress, chainID: number): Promise<TNFT[]> => {
		const rawAssets = await fetchAllAssetsFromAlchemy(chainID, userAddress);
		const assets = (rawAssets || [])
			.filter(
				(asset: TAlchemyAssets): boolean =>
					asset?.title !== '' &&
					asset?.contractMetadata?.name !== '' &&
					asset?.media !== null &&
					asset?.tokenUri !== null
			)
			.map(alchemyToNFT);
		return assets;
	}, []);

	const fetchNFTs = useCallback(
		async (userAddress: TAddress, chainID: number): Promise<void> => {
			set_nfts([]);
			set_selected([]);
			set_isFetchingNFTs(true);

			let assets: TNFT[] = [];
			if ([1, 10, 137, 42161].includes(chainID)) {
				assets = await handleAlchemyAssets(toAddress(userAddress), chainID);
			} else {
				assets = await filterNFTs(toAddress(userAddress), chainID);
			}

			set_nfts(assets);
			set_isFetchingNFTs(false);
		},
		[filterNFTs, handleAlchemyAssets]
	);

	/**********************************************************************************************
	 ** Fetch all NFTs from OpenSea. The OpenSea API only returns 200 NFTs at a time, so we need to
	 ** recursively fetch all NFTs from OpenSea if a cursor for next page is returned.
	 ** If no address is available, set NFTs to empty array.
	 **********************************************************************************************/
	useEffect((): void => {
		if (isZeroAddress(toAddress(address))) {
			return set_nfts([]);
		}

		fetchNFTs(toAddress(address), safeChainID);
	}, [address, fetchNFTs, safeChainID]);

	/**********************************************************************************************
	 ** On disconnect, reset all state.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		if (!isActive) {
			set_selected([]);
			set_nfts([]);
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
				currentStepContainer = document?.getElementById('approvals');
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

	/**********************************************************************************************
	 ** For some small performance improvements, we memoize the context value.
	 **********************************************************************************************/
	const contextValue = useMemo(
		(): TSelected => ({
			isFetchingNFTs,
			selected,
			set_selected,
			nfts,
			set_nfts,
			destinationAddress,
			set_destinationAddress,
			currentStep,
			set_currentStep
		}),
		[isFetchingNFTs, selected, nfts, destinationAddress, currentStep]
	);

	return (
		<NFTMigratooorContext.Provider value={contextValue}>
			<div
				id={'NFTMiratooorView'}
				className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</NFTMigratooorContext.Provider>
	);
};

export const useNFTMigratooor = (): TSelected => useContext(NFTMigratooorContext);
