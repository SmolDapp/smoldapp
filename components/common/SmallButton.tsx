import React, {forwardRef} from 'react';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

import type {ReactElement, ReactNode} from 'react';

export type TButtonVariant = 'filled' | 'outlined' | 'light' | 'inherit' | string;

export type	TButton = {
	children: ReactNode,
	variant?: TButtonVariant,
	shouldStopPropagation?: boolean,
	isBusy?: boolean,
	isDisabled?: boolean,
} & React.ComponentPropsWithoutRef<'button'>

export type TMouseEvent = React.MouseEvent<HTMLButtonElement> & React.MouseEvent<HTMLAnchorElement>;

// eslint-disable-next-line react/display-name
const SmallButton = forwardRef((props: TButton): ReactElement => {
	const	{children, variant = 'filled', shouldStopPropagation = false, isBusy = false, isDisabled = false, ...rest} = props;

	return (
		<button
			{...(rest as React.ComponentPropsWithoutRef<'button'>)}
			data-variant={variant}
			className={`yearn--button ${rest.className}`}
			aria-busy={isBusy}
			disabled={isDisabled || (rest as React.ComponentPropsWithoutRef<'button'>).disabled}
			onClick={(event: TMouseEvent): void => {
				if (shouldStopPropagation) {
					event.stopPropagation();
				}
				if (!isBusy && rest.onClick) {
					rest.onClick(event);
				}
			}}>
			{children}
			{isBusy ? (
				<div className={'absolute inset-0 flex items-center justify-center'}>
					<IconLoader className={'h-4 w-4 animate-spin text-neutral-0'} />
				</div>
			) : null}
		</button>
	);
});

export default SmallButton;
