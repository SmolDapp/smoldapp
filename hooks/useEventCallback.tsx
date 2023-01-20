import {useCallback, useRef} from 'react';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export default function useEventCallback<TArgs extends unknown[], TR>(fn: (...args: TArgs) => TR): (...args: TArgs) => TR {
	const ref = useRef<typeof fn>((): any => {
		throw new Error('Cannot call an event handler while rendering.');
	});

	useIsomorphicLayoutEffect((): void => {
		ref.current = fn;
	}, [fn]);

	return useCallback((...args: TArgs): any => ref.current(...args), [ref]);
}
