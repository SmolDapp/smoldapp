import React, {useCallback} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewDestination from '@nftmigratooor/1.ViewDestination';
import ViewTable from '@nftmigratooor/2.ViewTable';
import ViewApprovalWizard from '@nftmigratooor/3.ViewApprovalWizard';
import {NFTMigratooorContextApp, Step, useNFTMigratooor} from '@nftmigratooor/useNFTMigratooor';

import type {ReactElement} from 'react';

function NFTMigratooor(): ReactElement {
	const {currentStep, set_currentStep} = useNFTMigratooor();

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
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1
					className={
						'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'
					}>
					{'Migrate your JPEG like a pingouin.'}
				</h1>
				<b className={'text-neutral-500 mt-4 w-full text-base leading-normal md:w-2/3 md:text-lg md:leading-8'}>
					{'The easiest way to migrate your NFTs from one wallet to another.'}
				</b>
			</div>

			<div id={'destination'}>
				<ViewDestination onProceed={onProceedDestination} />
			</div>

			<div
				id={'selector'}
				className={`pt-10 transition-opacity ${
					[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewTable onProceed={onProceedSelector} />
			</div>

			<div
				id={'approvals'}
				className={`pt-10 transition-opacity ${
					[Step.CONFIRMATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewApprovalWizard />
			</div>
		</div>
	);
}

export default function WrapperNFTMigratooor(): ReactElement {
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
					}}
				/>
				<NFTMigratooor />
			</>
		</NFTMigratooorContextApp>
	);
}
