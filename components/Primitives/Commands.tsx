'use client';

import * as React from 'react';
import {Command as CommandPrimitive} from 'cmdk';
import {cl} from '@builtbymom/web3/utils';

export const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({className, ...props}, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cl('flex h-full w-full flex-col overflow-hidden rounded-md', className)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

export const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({className, ...props}, ref) => (
	<div
		className={'flex items-center p-2'}
		cmdk-input-wrapper={''}>
		<CommandPrimitive.Input
			ref={ref}
			className={cl(
				'flex h-10 w-full text-sm outline-none',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'rounded-lg border !border-neutral-400',
				'placeholder:text-neutral-600',
				className
			)}
			{...props}
		/>
	</div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className={'pb-4 pt-2 text-center text-xs text-neutral-600'}
		{...props}
	/>
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cl(
			'overflow-hidden p-1 pt-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
			className
		)}
		{...props}
	/>
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

export const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cl(
			"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-base outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
			className
		)}
		{...props}
	/>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
