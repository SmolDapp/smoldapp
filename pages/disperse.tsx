import React, {useCallback} from 'react';
import ViewWallet from 'components/apps/0.ViewWallet';
import ViewTokenToSend from '@disperse/1.ViewTokenToSend';
import ViewTable from '@disperse/2.ViewTable';
import ViewApprovalWizard from '@disperse/3.ViewApprovalWizard';
import {DisperseContextApp, Step, useDisperse} from '@disperse/useDisperse';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';

function Disperse(): ReactElement {
	const {walletType} = useWeb3();
	const {tokenToDisperse, currentStep, set_currentStep} = useDisperse();
	const isGnosisSafe = (walletType === 'EMBED_GNOSIS_SAFE');

	const onStartDisperse = useCallback((): void => {
		set_currentStep(Step.CONFIRMATION);
		document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
		if (isGnosisSafe) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		if (tokenToDisperse.address === ETH_TOKEN_ADDRESS) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		return document.getElementById('APPROVE_TOKEN_TO_DISPERSE')?.click();

	}, [isGnosisSafe, set_currentStep, tokenToDisperse.address]);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.TOSEND);
					document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}} />

			<div
				id={'tokenToSend'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION, Step.TOSEND].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewTokenToSend
					onProceed={(): void => {
						if (currentStep === Step.TOSEND) {
							performBatchedUpdates((): void => {
								set_currentStep(Step.SELECTOR);
							});
						}
					}} />
			</div>

			<div
				id={'selector'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewTable onProceed={onStartDisperse} />
			</div>

			<div
				id={'tldr'}
				className={`pt-10 transition-opacity ${[Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewApprovalWizard />
			</div>
		</div>
	);
}

export default function DisperseWrapper(): ReactElement {
	return (
		<DisperseContextApp>
			<Disperse />
		</DisperseContextApp>
	);
}

