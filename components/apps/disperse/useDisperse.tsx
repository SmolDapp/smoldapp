import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {scrollToTargetAdjusted} from 'utils/animations';
import {HEADER_HEIGHT} from 'utils/constants';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TTokenInfo} from '../../../contexts/useTokenList';

export enum	Step {
	WALLET = 'wallet',
	TOSEND = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TDisperseElement = {address: TAddress | undefined, label: string, amount: TNormalizedBN | undefined, UUID: string};

export type TSelected = {
	tokenToDisperse: TTokenInfo,
	currentStep: Step,
	disperseArray: TDisperseElement[],
	isDispersed: boolean,
	set_currentStep: Dispatch<SetStateAction<Step>>,
	set_tokenToDisperse: Dispatch<SetStateAction<TTokenInfo>>,
	set_disperseArray: Dispatch<SetStateAction<TDisperseElement[]>>,
	onResetDisperse: () => void
}
const {wrappedToken: mainnetToken} = getNetwork(1).contracts;
const defaultProps: TSelected = {
	tokenToDisperse: {
		address: ETH_TOKEN_ADDRESS,
		chainId: 1,
		name: mainnetToken?.coinName || 'Ether',
		symbol: mainnetToken?.coinSymbol || 'ETH',
		decimals: mainnetToken?.decimals || 18,
		logoURI: `https://assets.smold.app/api/token/${1}/${ETH_TOKEN_ADDRESS}/logo-128.png`
	},
	currentStep: Step.WALLET,
	disperseArray: [],
	isDispersed: false,
	set_tokenToDisperse: (): void => undefined,
	set_currentStep: (): void => undefined,
	set_disperseArray: (): void => undefined,
	onResetDisperse: (): void => undefined
};

export function newVoidRow(): TDisperseElement {
	return ({
		address: undefined,
		label: '',
		amount: undefined,
		UUID: crypto.randomUUID()
	});
}

const DisperseContext = createContext<TSelected>(defaultProps);
export const DisperseContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, walletType} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.WALLET);
	const [tokenToDisperse, set_tokenToDisperse] = useState<TTokenInfo>(defaultProps.tokenToDisperse);

	const [disperseArray, set_disperseArray] = useState<TDisperseElement[]>([]);
	const [isDispersed, set_isDispersed] = useState<boolean>(false);

	const onResetDisperse = (): void => {
		set_isDispersed(true);
		setTimeout((): void => {
			set_currentStep(Step.TOSEND);
			set_tokenToDisperse(defaultProps.tokenToDisperse);
			set_disperseArray([newVoidRow(), newVoidRow()]);
			set_isDispersed(false);
		}, 5000);
	};

	/**********************************************************************************************
	** This effect is used to directly jump the UI to the TOSEND section if the wallet is
	** already connected or if the wallet is a special wallet type (e.g. EMBED_LEDGER).
	** If the wallet is not connected, jump to the WALLET section to connect.
	**********************************************************************************************/
	useEffect((): void => {
		const isEmbedWallet = ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType);
		if ((isActive && address) || isEmbedWallet) {
			set_currentStep(Step.TOSEND);
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
			} else if (currentStep === Step.TOSEND || isEmbedWallet) {
				document?.getElementById('tokenToSend')?.scrollIntoView({behavior: 'smooth', block: 'start'});
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

			if (currentStep === Step.WALLET && !isEmbedWallet) {
				currentStepContainer = document?.getElementById('wallet');
			} else if (currentStep === Step.TOSEND || isEmbedWallet) {
				currentStepContainer = document?.getElementById('tokenToSend');
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
	}, [currentStep, walletType]);

	const contextValue = useMemo((): TSelected => ({
		currentStep,
		set_currentStep,
		tokenToDisperse,
		set_tokenToDisperse,
		disperseArray,
		set_disperseArray,
		isDispersed,
		onResetDisperse
	}), [currentStep, disperseArray, isDispersed, tokenToDisperse]);

	return (
		<DisperseContext.Provider value={contextValue}>
			<div className={'mx-auto w-full'}>
				{children}
				<div id={'scalooor'} />
			</div>
		</DisperseContext.Provider>
	);
};


export const useDisperse = (): TSelected => useContext(DisperseContext);
