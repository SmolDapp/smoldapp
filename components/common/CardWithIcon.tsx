
import {cloneElement} from 'react';
import IconCheck from 'components/icons/IconCheck';

import type {ReactElement} from 'react';

export type TCardWithIcon = {
	isSelected: boolean,
	onClick?: () => void;
	label: string;
	icon: ReactElement;
}
export default function CardWithIcon({isSelected, onClick, label, icon}: TCardWithIcon): ReactElement {
	return (
		<button
			className={`hover group relative flex w-full items-center justify-center p-4 md:p-6 ${isSelected ? 'box-100' : 'box-0'}`}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div
					suppressHydrationWarning
					className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0 md:h-12 md:w-12 ${isSelected ? 'bg-neutral-0' : ''}`}>
					{cloneElement(icon, {className: 'h-5 md:h-6 w-5 md:w-6 text-neutral-900'})}
				</div>
				<b suppressHydrationWarning className={'text-sm md:text-base'}>{label}</b>
			</div>
			<IconCheck
				className={`absolute right-4 top-4 h-4 w-4 text-[#16a34a] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
		</button>
	);
}
