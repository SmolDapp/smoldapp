import React from 'react';
import Header from 'components/common/Header';
import Meta from 'components/common/Meta';
import {AnimatePresence, motion} from 'framer-motion';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 0.67]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	WithLayout(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<div id={'app'} className={'mx-auto mb-0 flex w-full max-w-4xl flex-col'}>
				<Header />
				<AnimatePresence mode={'wait'}>
					<motion.div
						key={router.asPath}
						initial={'initial'}
						animate={'enter'}
						exit={'exit'}
						variants={thumbnailVariants}>
						<Component
							key={router.route}
							router={props.router}
							{...pageProps} />
					</motion.div>
				</AnimatePresence>
			</div>
		</React.Fragment>
	);
}

function	AppWrapper(props: AppProps): ReactElement {
	return (
		<>
			<Meta />
			<WithLayout {...props} />
		</>
	);
}

export default AppWrapper;
