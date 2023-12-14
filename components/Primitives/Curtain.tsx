'use client';

import {forwardRef} from 'react';
import * as CurtainPrimitive from '@radix-ui/react-dialog';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ElementRef, ReactElement} from 'react';

type TCurtainContent = {
	className?: string;
	children: ReactElement;
};

export const CurtainContent = forwardRef<ElementRef<typeof CurtainPrimitive.Content>, TCurtainContent>(
	({...props}, ref) => {
		const {children, className} = props as unknown as TCurtainContent;
		return (
			<>
				<CurtainPrimitive.Content
					ref={ref}
					className={cl(
						'absolute z-50 transition ease inset-y-0 h-full right-0 w-full max-w-[428px]',
						'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:slide-in-from-right',
						'data-[state=closed]:slide-out-to-right data-[state=closed]:animate-out data-[state=closed]:duration-300',
						className
					)}
					{...props}>
					{children}
				</CurtainPrimitive.Content>
			</>
		);
	}
);

CurtainContent.displayName = CurtainPrimitive.Content.displayName;
