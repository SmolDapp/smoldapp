'use client';

import {cloneElement} from 'react';
import Link from 'next/link';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from './Primitives/Tooltip';

import type {ReactElement} from 'react';

export type TSocialMediaCard = {
	icon: ReactElement;
	href: string;
	tooltip?: string;
	isDisabled?: boolean;
	target?: string;
};
export default function SocialMediaCard(props: TSocialMediaCard): ReactElement {
	if (!props.tooltip) {
		return (
			<Link
				href={props.href}
				target={props.target}
				rel={'noopener noreferrer'}>
				<div
					className={cl(
						'group relative flex w-full flex-row items-center justify-start',
						props.isDisabled ? 'pointer-events-none opacity-40' : ''
					)}>
					<div
						className={cl(
							'flex h-6 w-6 cursor-pointer items-center justify-center rounded-xl md:h-8 md:w-8',
							'border border-neutral-200 bg-neutral-0 transition-colors group-hover:bg-neutral-700'
						)}>
						{cloneElement(props.icon, {
							className: 'h-4 w-4 text-neutral-700 transition-colors group-hover:text-neutral-0'
						})}
					</div>
				</div>
			</Link>
		);
	}

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					<Link
						suppressHydrationWarning
						href={props.href}
						target={props.target}
						rel={'noopener noreferrer'}>
						<div
							suppressHydrationWarning
							className={cl(
								'group relative flex w-full flex-row items-center justify-start',
								props.isDisabled ? 'pointer-events-none opacity-40' : ''
							)}>
							<div
								className={cl(
									'flex h-6 w-6 cursor-pointer items-center justify-center rounded-xl md:h-8 md:w-8',
									'border border-neutral-200 bg-neutral-0 transition-colors group-hover:bg-neutral-700'
								)}>
								{cloneElement(props.icon, {
									className: 'h-4 w-4 text-neutral-700 transition-colors group-hover:text-neutral-0'
								})}
							</div>
						</div>
					</Link>
				</TooltipTrigger>
				<TooltipContent>
					<p>{props.tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
