import React from 'react';
import {DefaultSeo} from 'next-seo';
import ViewApprovalWizard from 'components/views/nftmigratooor/ViewApprovalWizard';
import ViewDestination from 'components/views/nftmigratooor/ViewDestination';
import ViewTable from 'components/views/nftmigratooor/ViewTable';
import ViewWallet from 'components/views/ViewWallet';
import {NFTMigratooorContextApp, Step, useNFTMigratooor} from 'contexts/useNFTMigratooor';

import type {ReactElement} from 'react';

function	Home(): ReactElement {
	const	{currentStep, set_currentStep} = useNFTMigratooor();

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.DESTINATION);
					document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}} />

			<div
				id={'destination'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION, Step.DESTINATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewDestination />
			</div>

			<div
				id={'selector'}
				className={`pt-10 transition-opacity ${[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewTable
					onProceed={(): void => {
						set_currentStep(Step.CONFIRMATION);
						document?.getElementById('approvals')?.scrollIntoView({behavior: 'smooth', block: 'center'});
						document?.getElementById('TRIGGER_NFT_MIGRATOOOR_HIDDEN')?.click();
					}} />
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

