'use client';

import * as React from 'react';
import {IconChevronBoth} from '@icons/IconChevronBoth';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import * as SelectPrimitive from '@radix-ui/react-select';
import {cl} from '@yearn-finance/web-lib/utils/cl';

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;

export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cl(
			'focus-within:outline-transparent outline-offset-0 outline rounded-md outline-transparent',
			'text-left relative px-2',
			'flex items-center justify-between h-full w-full text-sm placeholder:text-neutral-900/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
			className
		)}
		{...props}>
		{children}

		<SelectPrimitive.Icon asChild>
			<span className={'absolute right-2 flex h-3.5 w-3.5 items-center justify-center'}>
				<IconChevronBoth className={'h-4 w-4 opacity-50'} />
			</span>
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({className, children, position = 'popper', ...props}, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			className={cl(
				'relative z-50 max-h-52 min-w-[8rem] overflow-x-hidden rounded-md border border-neutral-200 bg-neutral-0 text-neutral-900 shadow-md p-0',
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				position === 'popper'
					? 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
					: '',
				className
			)}
			position={position}
			{...props}>
			<div className={'h-full w-full'}>
				<SelectPrimitive.Viewport
					className={cl(
						'w-full h-full',
						position === 'popper'
							? 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
							: ''
					)}>
					{children}
				</SelectPrimitive.Viewport>
			</div>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({className, ...props}, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cl('py-1.5 pr-8 pl-2 text-sm font-semibold', className)}
		{...props}
	/>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({className, children, ...props}, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cl(
			'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-neutral-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			className
		)}
		{...props}>
		<span className={'absolute right-2 flex h-3.5 w-3.5 items-center justify-center'}>
			<SelectPrimitive.ItemIndicator>
				<IconCircleCheck className={' h-3 w-3 text-green-600'} />
			</SelectPrimitive.ItemIndicator>
		</span>

		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
