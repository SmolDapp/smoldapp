import {useMemo} from 'react';
import {useRouter} from 'next/router';
import {getStateFromUrlQuery} from '@utils/url/getStateFromUrlQuery';

import type {TSendQuery} from 'components/sections/Send/useSendFlow';

export function useSendQuery(): {initialStateFromUrl: TSendQuery | null; stateFromUrl: TSendQuery} {
	const router = useRouter();
	const searchParams = new URLSearchParams(router.asPath.split('?')[1]);

	const queryParams = Object.fromEntries(searchParams.entries());
	const stateFromUrl = getStateFromUrlQuery<TSendQuery>(queryParams, ({string, array}) => ({
		to: string('to'),
		tokens: array('tokens'),
		values: array('values')
	}));

	const initialStateFromUrl = useMemo(() => {
		return stateFromUrl;
	}, []);

	return {initialStateFromUrl, stateFromUrl};
}
