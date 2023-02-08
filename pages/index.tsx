import React from 'react';
import ViewDestination from 'components/views/migratooor/ViewDestination';
import ViewTable from 'components/views/migratooor/ViewTable';
import ViewTLDR from 'components/views/migratooor/ViewTLDR';
import ViewWallet from 'components/views/ViewWallet';
import {MigratooorContextApp, Step, useMigratooor} from 'contexts/useMigratooor';
import thumbnailVariants from 'utils/animations';
import {motion} from 'framer-motion';

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

			<motion.div
				initial={'initial'}
				animate={[Step.SELECTOR, Step.CONFIRMATION, Step.DESTINATION].includes(currentStep) ? 'enter' : 'initial'}
				variants={thumbnailVariants}>
				<ViewDestination />
			</motion.div>

			<motion.div
				initial={'initial'}
				animate={[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? 'enter' : 'initial'}
				variants={thumbnailVariants}
				className={[Step.SELECTOR, Step.CONFIRMATION].includes(currentStep) ? '' : 'pointer-events-none'}>
				<section id={'selector'} className={'mt-10'}>
					<ViewTable />
					<ViewTLDR />
				</section>
			</motion.div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<MigratooorContextApp>
			<Home />
		</MigratooorContextApp>
	);
}

