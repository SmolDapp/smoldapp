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
				'hover box-0 group relative flex w-full items-center justify-center p-4 md:p-6',
				isSelected ? '!bg-primary-50' : ''
			)}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div
					suppressHydrationWarning
					className={`mb-4 flex size-10 items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0 md:size-12 ${
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
				className={`absolute right-4 top-4 size-4 text-[#16a34a] transition-opacity ${
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
					className={`mb-2 flex size-6 items-center justify-center rounded-full border border-primary-200 transition-colors group-hover:bg-primary-0 md:size-8 ${
						isSelected ? 'bg-primary-0' : ''
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
				className={`absolute right-4 top-4 size-4 text-[#16a34a] transition-opacity ${
					isSelected ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</button>
	);
}
