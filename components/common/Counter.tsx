import React, {useLayoutEffect, useRef} from 'react';
import {animate} from 'framer-motion';

import type {ReactElement} from 'react';

export function Counter({value, decimals = 18}: {value: number; decimals: number}): ReactElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nodeRef = useRef<any>();

	useLayoutEffect((): (() => void) => {
		const node = nodeRef.current;
		if (node) {
			const controls = animate(Number(node.textContent || 0), value, {
				duration: 1,
				onUpdate(value) {
					node.textContent = value.toFixed(decimals);
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
