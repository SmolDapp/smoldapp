import React, {useCallback} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/views/0.ViewWallet';
import ViewDestination from 'components/views/nftmigratooor/1.ViewDestination';
import ViewTable from 'components/views/nftmigratooor/2.ViewTable';
import ViewApprovalWizard from 'components/views/nftmigratooor/3.ViewApprovalWizard';
import {NFTMigratooorContextApp, Step, useNFTMigratooor} from 'contexts/useNFTMigratooor';

import type {ReactElement} from 'react';

function	Home(): ReactElement {
	const	{currentStep, set_currentStep} = useNFTMigratooor();

	const onProceedWallet = useCallback((): void => {
		set_currentStep(Step.DESTINATION);
		document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
	}, [set_currentStep]);

	const onProceedDestination = useCallback((): void => {
		set_currentStep(Step.SELECTOR);
		document?.getElementById('selector')?.scrollIntoView({behavior: 'smooth', block: 'center'});
	}, [set_currentStep]);

	const onProceedSelector = useCallback((): void => {
		set_currentStep(Step.CONFIRMATION);
		document?.getElementById('approvals')?.scrollIntoView({behavior: 'smooth', block: 'center'});
		document?.getElementById('TRIGGER_NFT_MIGRATOOOR_HIDDEN')?.click();
	}, [set_currentStep]);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<ViewWallet onSelect={onProceedWallet} />

			<div
				id={'destination'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION, Step.DESTINATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewDestination onProceed={onProceedDestination} />
			</div>

			<div
				id={'selector'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewTable onProceed={onProceedSelector} />
			</div>

			<div
				id={'approvals'}
				className={`pt-10 transition-opacity ${[Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewApprovalWizard />
			</div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<NFTMigratooorContextApp>
			<>
				<DefaultSeo
					title={'NFTMigratooor - SmolDapp'}
					defaultTitle={'NFTMigratooor - SmolDapp'}
					description={'The easiest way to migrate your NFTs from one wallet to another.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/nftmigratooor',
						site_name: 'NFTMigratooor - SmolDapp',
						title: 'NFTMigratooor - SmolDapp',
						description: 'The easiest way to migrate your NFTs from one wallet to another.',
						images: [
							{
								url: 'https://smold.app/og.png',
								width: 800,
								height: 400,
								alt: 'nftmigratooor'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Home />
			</>
		</NFTMigratooorContextApp>
	);
}

