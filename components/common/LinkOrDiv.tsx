import Link from 'next/link';

import type {ReactElement, ReactNode} from 'react';

type TProps = {
	href: string;
	isDisabled?: boolean;
	children?: ReactNode;
	passHref?: boolean;
	className?: string;
};

export function LinkOrDiv({href, isDisabled, children, passHref, ...rest}: TProps): ReactElement {
	if (isDisabled) {
		return (
			<button
				className={'w-full'}
				disabled={isDisabled}
				{...rest}>
				{children}
			</button>
		);
	}

	return (
		<Link
			href={href}
			passHref={passHref}
			{...rest}>
			{children}
		</Link>
	);
}
