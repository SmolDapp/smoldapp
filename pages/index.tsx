import React from 'react';
import ViewDestination from 'components/views/ViewDestination';
import ViewTable from 'components/views/ViewTable';
import ViewWallet from 'components/views/ViewWallet';
import {useSelected} from 'contexts/useSelected';
import {motion} from 'framer-motion';
import {useIsomorphicLayoutEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {isZeroAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 1]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	Home(): ReactElement {
	const	{isActive, address} = useWeb3();
	const	{destinationAddress} = useSelected();

	useIsomorphicLayoutEffect((): void => {
		if (!isZeroAddress(destinationAddress)) {
			setTimeout((): void => {
				document.getElementById('select')?.scrollIntoView({behavior: 'smooth'});
			}, 100);
		} else if (isActive && address) {
			setTimeout((): void => {
				document.getElementById('destination')?.scrollIntoView({behavior: 'smooth'});
			}, 100);
		} else {
			setTimeout((): void => {
				window.scrollTo({top: 0, behavior: 'smooth'});
			}, 100);
		}
	}, [destinationAddress, address, isActive]);

	return (
		<div key={'MigrateTable'} className={'mx-auto mt-10 min-h-screen w-full'}>
			<div className={'grid gap-2'}>
				<ViewWallet />
				<motion.div
					initial={'initial'}
					animate={isActive && address ? 'enter' : 'initial'}
					variants={thumbnailVariants}>
					<ViewDestination />
				</motion.div>
				<motion.div
					initial={'initial'}
					animate={!isZeroAddress(destinationAddress) ? 'enter' : 'initial'}
					variants={thumbnailVariants}>
					<ViewTable />
				</motion.div>
			</div>
		</div>
	);
}

export default Home;
