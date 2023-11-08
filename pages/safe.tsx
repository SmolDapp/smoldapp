import React, {useState} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/apps/0.ViewWallet';
import ViewFlowSelection from '@safeCreatooor/1.ViewFlowSelection';
import ViewClonableSafe from '@safeCreatooor/2.ViewClonableSafe';
import ViewNewSafeOwners from '@safeCreatooor/3.ViewNewSafeOwners';
import ViewNewSafe from '@safeCreatooor/4.ViewNewSafe';
import {SafeCreatorContextApp, Step, useSafeCreator} from '@safeCreatooor/useSafeCreator';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

function Safe(): ReactElement {
	const {currentStep, selectedFlow, set_currentStep} = useSafeCreator();
	const [owners, set_owners] = useState<TAddress[]>([]);
	const [threshold, set_threshold] = useState(1);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
					{'Make your multi-sig, multi-chain.'}
				</h1>
				<b className={'mt-4 w-full whitespace-pre text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'Get the same Safe address on all chains. \nWow, fancy!'}
				</b>
			</div>

			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.FLOW);
					document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}} />

			<div
				id={'flow'}
				className={`overflow-x-hidden pt-10 transition-opacity ${[Step.FLOW_DATA, Step.NEW_DEPLOY, Step.FLOW].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewFlowSelection />
			</div>


			<div
				id={'flowData'}
				className={`overflow-hidden pt-10 transition-opacity${[Step.FLOW_DATA, Step.NEW_DEPLOY].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				{selectedFlow === 'EXISTING' ? <ViewClonableSafe /> : null}
				{selectedFlow === 'NEW' ? (
					<ViewNewSafeOwners
						onUpdateSafeSettings={(newOwners, newThreshold): void => {
							set_currentStep(Step.NEW_DEPLOY);
							set_owners(newOwners);
							set_threshold(newThreshold);
						}} />
				) : null}
			</div>

			<div
				id={'newDeploy'}
				className={`pt-10 transition-opacity ${[Step.NEW_DEPLOY].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				{selectedFlow === 'NEW' ? <ViewNewSafe owners={owners} threshold={threshold} /> : null}
			</div>

		</div>
	);
}

export default function SafeWrapper(): ReactElement {
	return (
		<SafeCreatorContextApp>
			<>
				<DefaultSeo
					title={'MultiSafe - SmolDapp'}
					defaultTitle={'MultiSafe - SmolDapp'}
					description={'One address, all the chains. Deploy your Safe across multiple chains.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/safe',
						site_name: 'MultiSafe - SmolDapp',
						title: 'MultiSafe - SmolDapp',
						description: 'One address, all the chains. Deploy your Safe across multiple chains.',
						images: [
							{
								url: 'https://smold.app/og_multisafe.png',
								width: 800,
								height: 400,
								alt: 'MultiSafe'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Safe />
			</>
		</SafeCreatorContextApp>
	);
}

