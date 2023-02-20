import React from 'react';
import {DefaultSeo} from 'next-seo';
import ViewApprovalWizard from 'components/views/nftmigratooor/ViewApprovalWizard';
import ViewDestination from 'components/views/nftmigratooor/ViewDestination';
import ViewTable from 'components/views/nftmigratooor/ViewTable';
import ViewWallet from 'components/views/ViewWallet';
import {NFTMigratooorContextApp, Step, useNFTMigratooor} from 'contexts/useNFTMigratooor';
import thumbnailVariants from 'utils/animations';
import {motion} from 'framer-motion';

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

			<motion.div
				initial={'initial'}
				animate={[Step.SELECTOR, Step.CONFIRMATION, Step.DESTINATION].includes(currentStep) ? 'enter' : 'initial'}
				variants={thumbnailVariants}>
				<ViewDestination />
			</motion.div>

			<motion.div
				initial={'initial'}
				animate={[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? 'enter' : 'initial'}
				className={[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? '' : 'pointer-events-none'}
				variants={thumbnailVariants}>
				<ViewTable
					onProceed={(): void => {
						set_currentStep(Step.CONFIRMATION);
						document?.getElementById('approvals')?.scrollIntoView({behavior: 'smooth', block: 'center'});
					}} />
			</motion.div>

			<motion.div
				initial={'initial'}
				animate={currentStep === Step.CONFIRMATION ? 'enter' : 'initial'}
				className={[Step.CONFIRMATION].includes(currentStep) ? '' : 'pointer-events-none'}
				variants={thumbnailVariants}>
				<ViewApprovalWizard />
			</motion.div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<NFTMigratooorContextApp>
			<>
				<DefaultSeo
					title={'Migratooor'}
					defaultTitle={'Migratooor'}
					description={'The easiest way to migrate your tokens from one wallet to another.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://migratooor.com',
						site_name: 'Migratooor',
						title: 'Migratooor',
						description: 'The easiest way to migrate your tokens from one wallet to another.',
						images: [
							{
								url: 'https://smold.app/og_migratooor.png',
								width: 800,
								height: 400,
								alt: 'migratooor'
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

