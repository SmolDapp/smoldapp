import {cloneElement} from 'react';

import IconCheck from './icons/IconCheck';

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
			className={`hover group relative flex w-full items-center justify-center p-6 ${isSelected ? 'box-100' : 'box-0'}`}
			onClick={onClick}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div className={'mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 transition-colors group-hover:bg-neutral-0'}>
					{cloneElement(icon, {className: 'h-6 w-6 text-neutral-900'})}
				</div>
				<b>{label}</b>
			</div>
			<IconCheck
				className={`absolute top-4 right-4 h-4 w-4 text-[#16a34a] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
		</button>
	);
}
