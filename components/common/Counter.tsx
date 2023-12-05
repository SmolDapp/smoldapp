import React, {useLayoutEffect, useRef} from 'react';
import {animate} from 'framer-motion';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

export function Counter({value, decimals = 18}: {value: number; decimals: number}): ReactElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nodeRef = useRef<any>();
	const valueRef = useRef(value || 0);

	useLayoutEffect((): (() => void) => {
		const node = nodeRef.current;
		if (node) {
			const controls = animate(Number(valueRef.current || 0), value, {
				duration: 1,
				onUpdate(value) {
					valueRef.current = value;
					node.textContent = formatAmount(value.toFixed(decimals), decimals, decimals);
				}
			});
			return () => controls.stop();
		}
		return () => undefined;
	}, [value, decimals]);

	return (
		<span
			className={'font-number'}
			suppressHydrationWarning
			ref={nodeRef}
		/>
	);
}
