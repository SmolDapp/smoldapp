import React from 'react';
import {useRouter} from 'next/router';
import ViewDestination from 'components/views/ViewDestination';
import ViewTable from 'components/views/ViewTable';
import ViewTLDR from 'components/views/ViewTLDR';
import ViewWallet from 'components/views/ViewWallet';
import {motion} from 'framer-motion';
import {useIsomorphicLayoutEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {ReactElement} from 'react';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 1]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	Home(): ReactElement {
	const	{isActive, address} = useWeb3();
	const	router = useRouter();

	useIsomorphicLayoutEffect((): void => {
		if (isActive && address) {
			router.replace('#destination', '#destination', {shallow: true, scroll: false});
		}
	}, [address, isActive]);

	const	withHashDestination = router.asPath.includes('#destination');
	const	withHashSelect = router.asPath.includes('#select');

	return (
		<div key={'MigrateTable'} className={'mx-auto mt-10 min-h-screen w-full'}>
			<div className={'grid gap-2'}>
				<ViewWallet />
				<motion.div
					initial={'initial'}
					animate={withHashSelect || withHashDestination ? 'enter' : 'initial'}
					variants={thumbnailVariants}>
					<ViewDestination />
				</motion.div>
				<motion.div
					initial={'initial'}
					animate={withHashSelect ? 'enter' : 'initial'}
					variants={thumbnailVariants}>
					{withHashSelect || withHashDestination ? (
						<>
							<ViewTable />
							<ViewTLDR />
						</>
					) : null}
				</motion.div>
			</div>
		</div>
	);
}

export default Home;
