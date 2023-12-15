import React from 'react';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {InputHTMLAttributes, ReactElement} from 'react';

export function TextInput(
	props: {
		value: string | undefined;
		onChange: (value: string) => void;
	} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
): ReactElement {
	const {value, onChange, ...rest} = props;
	return (
		<input
			className={cl(
				'w-full border-neutral-400 rounded-lg bg-transparent py-3 px-4 text-base',
				'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
				'focus:placeholder:text-neutral-300 placeholder:transition-colors',
				'focus:border-neutral-600 disabled:bg-neutral-300 transition-colors'
			)}
			type={'text'}
			autoComplete={'off'}
			autoCorrect={'off'}
			spellCheck={'false'}
			value={value}
			onChange={e => onChange(e.target.value)}
			{...rest}
		/>
	);
}
