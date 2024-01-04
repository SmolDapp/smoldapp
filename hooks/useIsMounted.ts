import {useEffect, useState} from 'react';

export function useIsMounted(): boolean {
	const [isMounted, set_isMounted] = useState<boolean>(false);
	useEffect(() => set_isMounted(true), []);

	return isMounted;
}
