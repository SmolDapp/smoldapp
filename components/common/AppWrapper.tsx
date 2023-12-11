import React from 'react';
import Meta from 'components/common/Meta';
import thumbnailVariants from 'utils/animations';
import {AnimatePresence, motion} from 'framer-motion';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

function AppWrapper(props: AppProps): ReactElement {
	const {Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<Meta />
			<div className={'relative mx-auto mb-0 flex min-h-screen w-full flex-row pt-0'}>
				<AnimatePresence mode={'wait'}>
					<motion.div
						key={router.pathname}
						initial={'initial'}
						animate={'enter'}
						exit={'exit'}
						className={'w-full justify-center'}
						variants={thumbnailVariants}>
						<Component
							key={router.route}
							router={props.router}
							{...pageProps}
						/>
					</motion.div>
				</AnimatePresence>
			</div>
		</React.Fragment>
	);
}

export default AppWrapper;
