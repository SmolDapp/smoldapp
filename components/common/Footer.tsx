import React from 'react';
import Logo from 'components/icons/logo';

import type {ReactElement} from 'react';

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


export default Footer;
