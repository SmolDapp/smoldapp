import {cloneElement} from 'react';
import Link from 'next/link';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from './Primitives/Tooltip';

import type {ReactElement} from 'react';

export type TSocialMediaCard = {
	icon: ReactElement;
	href: string;
	tooltip?: string;
	className?: string;
};
export default function SocialMediaCard(props: TSocialMediaCard): ReactElement {
	if (!props.tooltip) {
		return (
			<Link
				href={props.href || ''}
				target={'_blank'}
				className={cl('!cursor-pointer', props.className)}
				rel={'noopener noreferrer'}>
				<div className={'group relative flex w-full flex-row items-center justify-start'}>
					<div
						suppressHydrationWarning
						className={cl(
							'flex h-6 w-6 cursor-pointer items-center justify-center rounded-xl md:h-9 md:w-9',
							'border border-neutral-200 bg-neutral-0 transition-colors group-hover:bg-neutral-700'
						)}>
						{cloneElement(props.icon, {
							className: 'h-5 w-5 text-neutral-700 transition-colors group-hover:text-neutral-0'
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
						href={props.href || ''}
						target={'_blank'}
						className={cl('!cursor-pointer', props.className)}
						rel={'noopener noreferrer'}>
						<div className={'group relative flex w-full flex-row items-center justify-start'}>
							<div
								suppressHydrationWarning
								className={cl(
									'flex h-6 w-6 cursor-pointer items-center justify-center rounded-xl md:h-9 md:w-9',
									'border border-neutral-200 bg-neutral-0 transition-colors group-hover:bg-neutral-700'
								)}>
								{cloneElement(props.icon, {
									className: 'h-5 w-5 text-neutral-700 transition-colors group-hover:text-neutral-0'
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
