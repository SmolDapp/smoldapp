import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useUpdateEffect} from '@react-hookz/web';
import {scrollToTargetAdjusted} from '@utils/animations';
import {HEADER_HEIGHT} from '@utils/constants';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

export enum Step {
	TOSEND = 'destination',
	SELECTOR = 'selector',
	CONFIRMATION = 'confirmation'
}

export type TDisperseElement = {
	address: TAddress | undefined;
	label: string;
	amount: TNormalizedBN | undefined;
	UUID: string;
};

export type TSelected = {
	tokenToDisperse: TToken;
	currentStep: Step;
	disperseArray: TDisperseElement[];
	isDispersed: boolean;
	set_currentStep: Dispatch<SetStateAction<Step>>;
	set_tokenToDisperse: Dispatch<SetStateAction<TToken>>;
	set_disperseArray: Dispatch<SetStateAction<TDisperseElement[]>>;
	onResetDisperse: () => void;
};
const {wrappedToken: mainnetToken} = getNetwork(1).contracts;
const defaultProps: TSelected = {
	tokenToDisperse: {
		address: ETH_TOKEN_ADDRESS,
		chainID: 1,
		name: mainnetToken?.coinName || 'Ether',
		symbol: mainnetToken?.coinSymbol || 'ETH',
		decimals: mainnetToken?.decimals || 18,
		logoURI: `https://assets.smold.app/api/token/${1}/${ETH_TOKEN_ADDRESS}/logo-128.png`
	},
	currentStep: Step.TOSEND,
	disperseArray: [],
	isDispersed: false,
	set_tokenToDisperse: (): void => undefined,
	set_currentStep: (): void => undefined,
	set_disperseArray: (): void => undefined,
	onResetDisperse: (): void => undefined
};

export function newVoidRow(): TDisperseElement {
	return {
		address: undefined,
		label: '',
		amount: undefined,
		UUID: crypto.randomUUID()
	};
}

const DisperseContext = createContext<TSelected>(defaultProps);
export const DisperseContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address, isActive, isWalletSafe, isWalletLedger, onConnect} = useWeb3();
	const [currentStep, set_currentStep] = useState<Step>(Step.TOSEND);
	const [tokenToDisperse, set_tokenToDisperse] = useState<TToken>(defaultProps.tokenToDisperse);

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

			if (currentStep === Step.TOSEND) {
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
	}, [currentStep, isWalletLedger, isWalletSafe]);

	const contextValue = useMemo(
		(): TSelected => ({
			currentStep,
			set_currentStep,
			tokenToDisperse,
			set_tokenToDisperse,
			disperseArray,
			set_disperseArray,
			isDispersed,
			onResetDisperse
		}),
		[currentStep, disperseArray, isDispersed, tokenToDisperse]
	);

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
