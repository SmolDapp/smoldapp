import React from 'react';
import {cl} from '@builtbymom/web3/utils';
import {IconCircleCheck} from '@icons/IconCircleCheck';

import type {ReactElement} from 'react';

export function TemplateButton(props: {
	title: string;
	description: string;
	isSelected: boolean;
	onSelect: () => void;
}): ReactElement {
	return (
		<button
			type={'button'}
			className={cl(
				'hover box-0 group relative flex w-full p-2 md:p-4 text-left',
				props.isSelected ? '!bg-primary-50' : ''
			)}
			onClick={props.onSelect}>
			<div>
				<b>{props.title}</b>
				<small className={'whitespace-break-spaces'}>{props.description}</small>
			</div>
			<IconCircleCheck
				className={`text-green absolute right-4 top-4 size-4 transition-opacity ${
					props.isSelected ? 'opacity-100' : 'opacity-0'
				}`}
			/>
		</button>
	);
}
