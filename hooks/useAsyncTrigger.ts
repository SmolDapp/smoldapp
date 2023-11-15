/* eslint-disable react-hooks/exhaustive-deps */

import {type DependencyList, useCallback, useEffect} from 'react';

//Should be useAsyncEffect, but exhaustive-deps is messing with this.
function useAsyncTrigger(effect: () => Promise<void>, deps: DependencyList): () => Promise<void> {
	const asyncEffectInCallback = useCallback(async (): Promise<void> => {
		effect();
	}, [...deps]);

	useEffect((): void => {
		asyncEffectInCallback();
	}, [asyncEffectInCallback]);

	return asyncEffectInCallback;
}

export {useAsyncTrigger};
