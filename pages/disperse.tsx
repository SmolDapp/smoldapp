import React, {useCallback} from 'react';
import {DefaultSeo} from 'next-seo';
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
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'}>
					{'Disperse tokens in a single click.'}
				</h1>
				<b className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'Pay contributors, send out grants or just transfer tokens to friends with disperse.'}
				</b>
			</div>

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
			<>
				<DefaultSeo
					title={'Disperse - SmolDapp'}
					defaultTitle={'Disperse - SmolDapp'}
					description={'Distribute ether or tokens to multiple addresses'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://disperse.smold.app',
						site_name: 'Disperse - SmolDapp',
						title: 'Disperse - SmolDapp',
						description: 'Distribute ether or tokens to multiple addresses',
						images: [
							{
								url: 'https://smold.app/og_disperse.png',
								width: 800,
								height: 400,
								alt: 'disperse'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Disperse />
			</>
		</DisperseContextApp>
	);
}

