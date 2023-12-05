import React from 'react';
import {DefaultSeo} from 'next-seo';
import ViewFlowSelection from 'components/apps/stream/0.ViewFlowSelection';
import ViewVestingConfiguration from 'components/apps/stream/1.ViewStreamConfiguration';
import ViewVestingSummary from 'components/apps/stream/2.ViewStreamSummary';
import ViewUserVestings from 'components/apps/stream/3.ViewUserStreams';
import {Step, StreamContextApp, useStream} from '@stream/useStream';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

function Stream(): ReactElement {
	const {currentStep, currentFlow} = useStream();

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
					{'SmolStream'}
				</h1>
				<b
					className={cl(
						'mt-4 w-full whitespace-pre text-base leading-normal text-neutral-500',
						'md:w-2/3 md:text-lg md:leading-8'
					)}>
					{'Whether it’s salaries, a token vest, or something else… \n'}
					{'Stream it simply, safely and sexily with SmolStream.'}
				</b>
			</div>

			<div id={'flow'}>
				<ViewFlowSelection />
			</div>

			<div
				id={'configuration'}
				className={`pt-10 transition-opacity ${
					[Step.SUMMARY, Step.CONFIGURATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				{currentFlow === 'CHECK' ? <ViewUserVestings /> : <ViewVestingConfiguration />}
			</div>

			<div
				id={'summary'}
				className={`overflow-x-hidden pt-10 transition-opacity ${
					[Step.SUMMARY].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewVestingSummary />
			</div>
		</div>
	);
}

export default function VestingWrapper(): ReactElement {
	return (
		<StreamContextApp>
			<>
				<DefaultSeo
					title={'SmolStream - SmolDapp'}
					defaultTitle={'SmolStream - SmolDapp'}
					description={'Stream it simply, safely and sexily with SmolStream.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/stream',
						site_name: 'SmolStream - SmolDapp',
						title: 'SmolStream - SmolDapp',
						description: 'Stream it simply, safely and sexily with SmolStream.',
						images: [
							{
								url: 'https://smold.app/og_stream.png',
								width: 800,
								height: 400,
								alt: 'Stream'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}}
				/>
				<Stream />
			</>
		</StreamContextApp>
	);
}
