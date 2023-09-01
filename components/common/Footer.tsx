import React from 'react';
import Logo from 'components/icons/logo';

import type {ReactElement} from 'react';

function	Footer(): ReactElement {
	return (
		<footer className={'mx-auto mb-0 mt-auto flex w-full max-w-5xl flex-col pt-6 md:pt-0'}>
			<div className={'grid h-10 w-full grid-cols-2'}>
				<div className={'flex flex-row items-center space-x-6'}>
					<Logo className={'h-2 w-2 text-neutral-500'} />
					<a
						href={'/github'}
						target={'_blank'}
						rel={'noreferrer'}>
						<p className={'cursor-pointer text-xs text-neutral-500 transition-colors hover:text-neutral-900'}>
							{'Github'}
						</p>
					</a>
				</div>
			</div>
		</footer>
	);
}


export default Footer;
