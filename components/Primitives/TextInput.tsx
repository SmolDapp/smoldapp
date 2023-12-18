import React from 'react';

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
			className={'input'}
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
