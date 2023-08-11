import React from 'react';

import type {ReactElement} from 'react';

type TViewSectionHeading = {
	title: ReactElement | string,
	content: ReactElement | string,
}
function ViewSectionHeading({title, content}: TViewSectionHeading): ReactElement {
	return (
		<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
			<div className={'w-full md:w-3/4'}>
				<b>{title}</b>
				<p className={'whitespace-pre-wrap text-sm text-neutral-500'}>
					{content}
				</p>
			</div>
		</div>

	);
}

export default ViewSectionHeading;
