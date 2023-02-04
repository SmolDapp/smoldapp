import React from 'react';
import ViewDestination from 'components/views/migratooor/ViewDestination';
import ViewTable from 'components/views/migratooor/ViewTable';
import ViewTLDR from 'components/views/migratooor/ViewTLDR';
import ViewWallet from 'components/views/ViewWallet';
import {SelectedContextApp, Step, useSelected} from 'contexts/useSelected';
import thumbnailVariants from 'utils/animations';
import {motion} from 'framer-motion';

import type {ReactElement} from 'react';

function	Home(): ReactElement {
	const	{currentStep, set_currentStep} = useSelected();

	return (
		<div
			key={'MigrateTable'}
			className={'mx-auto w-full pb-[10vh] md:pb-[50vh]'}>
			<div className={'grid gap-2'}>
				<ViewWallet
					onSelect={(): void => {
						set_currentStep(Step.SELECTOR);
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
					<>
						<ViewTable />
						<ViewTLDR />
					</>
				</motion.div>
			</div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<SelectedContextApp>
			<Home />
		</SelectedContextApp>
	);
}

