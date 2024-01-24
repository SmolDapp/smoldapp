'use client';

import {forwardRef} from 'react';
import {cl} from '@builtbymom/web3/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import type {ComponentPropsWithoutRef, ElementRef} from 'react';

export const TooltipContent = forwardRef<
	ElementRef<typeof TooltipPrimitive.Content>,
	ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({className, sideOffset = 4, ...props}, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={cl(
			'z-50 overflow-hidden rounded-md px-2 py-1.5',
			'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			'PopoverContent z-10 rounded-lg bg-primary-0 p-0',
			className
		)}
		{...props}
	/>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
