import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import ViewDestination from 'components/views/ViewDestination';
import ViewTable from 'components/views/ViewTable';
import ViewTLDR from 'components/views/ViewTLDR';
import ViewWallet from 'components/views/ViewWallet';
import {motion} from 'framer-motion';
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

	useEffect((): void => {
		if (isActive && address) {
			router.replace({pathname: '/', hash: 'destination'}, undefined, {shallow: true, scroll: false});
		} else if (!isActive || !address) {
			router.replace({pathname: '/', hash: 'wallet'}, undefined, {shallow: true, scroll: false});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, isActive]);

	const	withHashDestination = router.asPath.includes('#destination');
	const	withHashSelect = router.asPath.includes('#select');

	return (
		<div
			key={'MigrateTable'}
			className={'mx-auto w-full pb-[10vh] md:pb-[50vh]'}>
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
					<>
						<ViewTable />
						<ViewTLDR />
					</>
				</motion.div>
			</div>
		</div>
	);
}

export default Home;
