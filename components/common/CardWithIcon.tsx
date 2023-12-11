import {cloneElement} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

export type TCardWithIcon = {
	isSelected: boolean;
	onClick?: () => void;
	label: string;
	icon: ReactElement;
};
export default function CardWithIcon({isSelected, onClick, label, icon}: TCardWithIcon): ReactElement {
	return (
		<button
			className={cl(
				'hover box-0 group relative flex w-full h-full items-center justify-center p-4 md:p-6',
				isSelected ? '!bg-primary-50' : ''
			)}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div
					suppressHydrationWarning
					className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0 md:h-12 md:w-12 ${
						isSelected ? 'bg-neutral-0' : ''
					}`}>
					{cloneElement(icon, {className: 'h-5 md:h-6 w-5 md:w-6 text-neutral-900'})}
				</div>
				<b
					suppressHydrationWarning
					className={'text-sm md:text-base'}>
					{label}
				</b>
			</div>
			<IconCircleCheck
				className={`absolute right-4 top-4 h-4 w-4 text-[#16a34a] transition-opacity ${
					isSelected ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</button>
	);
}

export function SmallCardWithIcon({isSelected, onClick, label, icon}: TCardWithIcon): ReactElement {
	return (
		<button
			className={cl(
				'hover box-0 group relative flex w-full items-center justify-center p-2 md:p-4',
				isSelected ? '!bg-primary-50' : ''
			)}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div
					suppressHydrationWarning
					className={`border-primary-200 mb-2 flex h-6 w-6 items-center justify-center rounded-full border transition-colors group-hover:bg-neutral-0 md:h-8 md:w-8 ${
						isSelected ? 'bg-neutral-0' : ''
					}`}>
					{cloneElement(icon, {className: 'h-2 md:h-4 w-2 md:w-4 text-primary-900'})}
				</div>
				<b
					suppressHydrationWarning
					className={'text-sm'}>
					{label}
				</b>
			</div>
			<IconCircleCheck
				className={`absolute right-4 top-4 h-4 w-4 text-[#16a34a] transition-opacity ${
					isSelected ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</button>
	);
}

type TRowCardWithIcon = {
	onClick?: () => void;
	title: string;
	description: string;
	icon: ReactElement;
	className?: string;
};
export function RowCardWithIcon({onClick, title, description, icon, className}: TRowCardWithIcon): ReactElement {
	return (
		<button
			className={cl(className, 'hover box-0 group relative flex w-full p-4')}
			onClick={onClick}>
			<div className={'relative flex h-full flex-col items-center md:flex-row'}>
				<div
					suppressHydrationWarning
					className={cl(
						'flex items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0',
						'mb-2 mr-0 md:mb-0 md:mr-6',
						'h-10 w-10 min-h-[40px] min-w-[40px]'
					)}>
					{cloneElement(icon)}
				</div>
				<div className={'w-full text-left'}>
					<b className={'text-xs md:text-base'}>{title}</b>
					<p className={'mt-0.5 text-sm text-neutral-600'}>{description}</p>
				</div>
			</div>
		</button>
	);
}
