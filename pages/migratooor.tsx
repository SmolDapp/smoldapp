import React, {useCallback} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/apps/0.ViewWallet';
import ViewDestination from '@migratooor/1.ViewDestination';
import ViewTable from '@migratooor/2.ViewTable';
import ViewApprovalWizard from '@migratooor/3.ViewApprovalWizard';
import {MigratooorContextApp, Step, useMigratooor} from '@migratooor/useMigratooor';

import type {ReactElement} from 'react';

function	Migrate(): ReactElement {
	const {currentStep, set_currentStep} = useMigratooor();

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
		document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
		document?.getElementById('TRIGGER_ERC20_MIGRATOOOR_HIDDEN')?.click();
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
				id={'tldr'}
				className={`pt-10 transition-opacity ${[Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
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
					}} />
				<Migrate />
			</>
		</MigratooorContextApp>
	);
}

