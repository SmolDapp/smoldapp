import React, {useCallback} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewDestination from '@migratooor/1.ViewDestination';
import ViewTable from '@migratooor/2.ViewTable';
import ViewApprovalWizard from '@migratooor/3.ViewApprovalWizard';
import {MigratooorContextApp, Step, useMigratooor} from '@migratooor/useMigratooor';

import type {ReactElement} from 'react';

function Migrate(): ReactElement {
	const {currentStep, set_currentStep} = useMigratooor();

	const onProceedDestination = useCallback((): void => {
		set_currentStep(Step.SELECTOR);
		document?.getElementById('selector')?.scrollIntoView({behavior: 'smooth', block: 'center'});
	}, [set_currentStep]);

	const onProceedSelector = useCallback((): void => {
		set_currentStep(Step.CONFIRMATION);
		document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
		document?.getElementById('TRIGGER_ERC20_MIGRATOOOR_HIDDEN')?.click();
	}, [set_currentStep]);

	return (
		<div className={'mx-auto grid w-full max-w-5xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1
					className={
						'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'
					}>
					{'Migrate like a fancy bird.'}
				</h1>
				<b className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'The easiest way to migrate your tokens from one wallet to another.'}
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
				id={'tldr'}
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

export default function WrapperMigrate(): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={'Migratooor - SmolDapp'}
					defaultTitle={'Migratooor - SmolDapp'}
					description={'The easiest way to migrate your tokens from one wallet to another.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/migratooor',
						site_name: 'Migratooor - SmolDapp',
						title: 'Migratooor - SmolDapp',
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
					}}
				/>
				<Migrate />
			</>
		</MigratooorContextApp>
	);
}
