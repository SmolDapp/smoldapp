import React from 'react';
import {cl} from '@builtbymom/web3/utils';

import type {ReactElement} from 'react';

type TViewSectionHeading = {
	title: ReactElement | string;
	content: ReactElement | string;
	configSection?: ReactElement;
	className?: string;
};
function ViewSectionHeading({title, content, configSection, className}: TViewSectionHeading): ReactElement {
	return (
		<div className={cl('relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6', className)}>
			<div className={'w-full md:w-3/4'}>
				<b suppressHydrationWarning>{title}</b>
				<p
					suppressHydrationWarning
					className={'whitespace-pre-wrap text-sm text-neutral-500'}>
					{content}
				</p>
			</div>
			{configSection ? (
				<div className={'absolute right-2 top-2 flex flex-col space-y-4 md:right-4 md:top-4'}>
					{configSection}
				</div>
			) : null}
		</div>
	);
}

export default ViewSectionHeading;
