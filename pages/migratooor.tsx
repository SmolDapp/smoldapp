import React from 'react';
import {DefaultSeo} from 'next-seo';
import ViewApprovalWizard from 'components/views/migratooor/ViewApprovalWizard';
import ViewDestination from 'components/views/migratooor/ViewDestination';
import ViewTable from 'components/views/migratooor/ViewTable';
import ViewWallet from 'components/views/ViewWallet';
import {MigratooorContextApp, Step, useMigratooor} from 'contexts/useMigratooor';
import {WalletContextApp} from 'contexts/useWallet';

import type {ReactElement} from 'react';

function	Home(): ReactElement {
	const	{currentStep, set_currentStep} = useMigratooor();

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
						document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
						document?.getElementById('TRIGGER_ERC20_MIGRATOOOR_HIDDEN')?.click();
					}} />
			</div>

			<div
				id={'tldr'}
				className={`pt-10 transition-opacity ${[Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewApprovalWizard />
			</div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<WalletContextApp>
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
					<Home />
				</>
			</MigratooorContextApp>
		</WalletContextApp>
	);
}

