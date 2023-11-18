import React, {useEffect} from 'react';

import type {ForwardedRef, RefObject} from 'react';

export function useForwardedRef<T>(ref: ForwardedRef<T>): RefObject<T> {
	const innerRef = React.useRef<T>(null);

	useEffect(() => {
		if (!ref) {
			return;
		}
		if (typeof ref === 'function') {
			ref(innerRef.current);
		} else {
			ref.current = innerRef.current;
		}
	});

	return innerRef;
}
