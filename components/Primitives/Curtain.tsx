'use client';

import {Content} from '@radix-ui/react-dialog';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';
import type {DialogContentProps} from '@radix-ui/react-dialog';

export const CurtainContent = (props: DialogContentProps): ReactElement => {
	const {className, children, ...rest} = props;
	return (
		<>
			<Content
				{...rest}
				tabIndex={-1}
				className={cl(
					'absolute z-50 transition ease inset-y-0 h-full right-0 w-full max-w-[428px]',
					'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:slide-in-from-right',
					'data-[state=closed]:slide-out-to-right data-[state=closed]:animate-out data-[state=closed]:duration-300',
					className
				)}>
				{children}
			</Content>
		</>
	);
};
