import React from 'react';
import Header from 'components/common/Header';
import Meta from 'components/common/Meta';
import Logo from 'components/icons/logo';
import {AnimatePresence, motion} from 'framer-motion';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 0.67]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	Footer(): ReactElement {
	return (
		<footer className={'mx-auto mt-auto mb-0 flex w-full max-w-6xl flex-col pt-6 md:pt-0'}>
			<div className={'grid h-10 w-full grid-cols-2'}>
				<div className={'flex flex-row items-center space-x-6'}>
					<Logo className={'h-4 w-4 text-neutral-400'} />
					<a
						href={'/github'}
						target={'_blank'}
						rel={'noreferrer'}>
						<p className={'cursor-pointer text-xs text-neutral-400 transition-colors hover:text-neutral-900'}>
							{'Github'}
						</p>
					</a>
				</div>
			</div>
		</footer>
	);
}

function	WithLayout(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<div id={'app'} className={'mx-auto mb-0 flex min-h-screen w-full max-w-4xl flex-col'}>
				<Header />
				<AnimatePresence mode={'wait'}>
					<motion.div
						key={router.pathname}
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
				<Footer />
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
