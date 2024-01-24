import {Fragment} from 'react';
import {Popover, Transition} from '@headlessui/react';
import {IconSettings} from '@yearn-finance/web-lib/icons/IconSettings';

import type {ReactElement, ReactNode} from 'react';

export function PopoverSettings({children}: {children: ReactNode}): ReactElement {
	return (
		<Popover
			as={'div'}
			className={'relative z-10 inline-block text-left'}>
			<Popover.Button className={'p-2 text-neutral-400 hover:text-primary'}>
				<IconSettings
					className={'size-4'}
					aria-hidden={'true'}
				/>
			</Popover.Button>
			<Transition
				as={Fragment}
				enter={'transition ease-out duration-200'}
				enterFrom={'opacity-0 translate-y-1'}
				enterTo={'opacity-100 translate-y-0'}
				leave={'transition ease-in duration-150'}
				leaveFrom={'opacity-100 translate-y-0'}
				leaveTo={'opacity-0 translate-y-1'}>
				<Popover.Panel
					className={
						'box-0 absolute right-0 z-50 mt-2 flex max-h-96 w-max min-w-fit max-w-sm flex-col gap-6 overflow-y-auto p-4 scrollbar-none'
					}>
					{children}
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}
