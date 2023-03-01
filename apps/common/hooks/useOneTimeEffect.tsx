import {useEffect, useRef} from 'react';

import type {DependencyList, EffectCallback} from 'react';

function useOneTimeEffect(
	effect: EffectCallback,
	triggerCondition: () => boolean,
	deps: DependencyList
): void {
	const ref = useRef(false);
	useEffect((): void => {
		if (!ref.current && triggerCondition()) {
			ref.current = true;
			effect();
		}
	}, deps);
}
export default useOneTimeEffect;
