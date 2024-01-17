'use client';

import React, {forwardRef} from 'react';
import {IconCheckbox} from '@icons/IconCheckbox';
import {IconCheckboxChecked} from '@icons/IconCheckboxChecked';
import {CheckboxItem, Content, Portal, Separator} from '@radix-ui/react-dropdown-menu';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

export const DropdownMenuContent = forwardRef(
	({className, sideOffset = 4, ...props}: any, ref): ReactElement => (
		<Portal>
			<Content
				ref={ref}
				align={'start'}
				sideOffset={sideOffset}
				className={cl(
					'z-50 min-w-[16rem] overflow-hidden rounded-md border border-neutral-400 bg-neutral-0 p-1',
					'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
					'data-[side=bottom]:slide-in-from-top-2',
					'DropdownMenuContent',
					className
				)}
				{...props}
			/>
		</Portal>
	)
);
DropdownMenuContent.displayName = Content.displayName;

export const DropdownMenuCheckboxItem = forwardRef(({className, children, checked, ...props}: any, ref) => (
	<CheckboxItem
		ref={ref}
		className={cl(
			'relative flex cursor-pointer items-center rounded-lg py-2 pl-8 pr-2',
			'outline-none select-none transition-colors',
			'text-xs text-neutral-800 group',
			'focus:bg-neutral-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			className
		)}
		checked={checked}
		onSelect={(e: Event) => e.preventDefault()}
		{...props}>
		<span
			className={cl(
				'absolute left-2 flex h-4 w-4 items-center justify-center',
				!checked ? 'opacity-100' : 'opacity-0'
			)}>
			<IconCheckbox className={'h-4 w-4'} />
		</span>
		<span
			className={cl(
				'absolute left-2 flex h-4 w-4 items-center justify-center',
				checked ? 'opacity-100' : 'opacity-0'
			)}>
			<IconCheckboxChecked className={'h-4 w-4'} />
		</span>
		{children}
	</CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = CheckboxItem.displayName;

export const DropdownMenuSeparator = forwardRef(({className, ...props}: any, ref) => (
	<Separator
		ref={ref}
		style={{width: 'calc(100% - 16px)'}}
		className={cl('my-1 h-px w-full mx-auto bg-neutral-400', className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = Separator.displayName;
