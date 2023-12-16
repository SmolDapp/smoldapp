'use client';

import {IconCheckbox} from '@icons/IconCheckbox';
import {IconCheckboxChecked} from '@icons/IconCheckboxChecked';
import {CheckboxItem, Content, Separator} from '@radix-ui/react-dropdown-menu';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

export function DropdownMenuContent({sideOffset = 4, ...props}: any): ReactElement {
	return (
		<Content
			sideOffset={sideOffset}
			className={cl(
				'z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-400 bg-neutral-0 p-1',
				'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
				'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
				'data-[side=bottom]:slide-in-from-top-2',
				'DropdownMenuContent',
				props.className
			)}
			{...props}
		/>
	);
}

export function DropdownMenuCheckboxItem({...props}: any): ReactElement {
	return (
		<CheckboxItem
			className={cl(
				'relative flex cursor-pointer items-center rounded-lg py-2 pl-8 pr-2',
				'outline-none select-none transition-colors',
				'text-xs text-neutral-800 group',
				'focus:bg-neutral-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				props.className
			)}
			checked={props.checked}
			onSelect={(e: Event) => e.preventDefault()}
			{...props}>
			<span
				className={cl(
					'absolute left-2 flex h-4 w-4 items-center justify-center',
					!props.checked ? 'opacity-100' : 'opacity-0'
				)}>
				<IconCheckbox className={'h-4 w-4'} />
			</span>
			<span
				className={cl(
					'absolute left-2 flex h-4 w-4 items-center justify-center',
					props.checked ? 'opacity-100' : 'opacity-0'
				)}>
				<IconCheckboxChecked className={'h-4 w-4'} />
			</span>
			{props.children}
		</CheckboxItem>
	);
}

export function DropdownMenuSeparator({...props}: any): ReactElement {
	return (
		<Separator
			style={{width: 'calc(100% - 16px)'}}
			className={cl('my-1 h-px w-full mx-auto bg-neutral-400', props.className)}
			{...props}
		/>
	);
}
