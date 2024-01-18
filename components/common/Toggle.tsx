import {Switch} from '@headlessui/react';

import type {ReactElement} from 'react';

export default function Toggle({
	isEnabled,
	onChange
}: {
	isEnabled: boolean;
	onChange: (isEnabled: boolean) => void;
}): ReactElement {
	return (
		<Switch
			checked={isEnabled}
			onChange={onChange}
			className={`relative mt-[1px] flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0 ${
				isEnabled ? 'border-primary bg-primary' : 'bg-primary-300/20 border-primary'
			}`}>
			<span
				aria-hidden={'true'}
				className={`pointer-events-none inline-block h-[8px] w-[8px] rounded-full shadow ring-0 transition-all duration-200 ease-in-out ${
					isEnabled ? 'bg-neutral-0 mr-1 translate-x-5' : 'bg-primary ml-1 translate-x-0'
				}`}
			/>
		</Switch>
	);
}
