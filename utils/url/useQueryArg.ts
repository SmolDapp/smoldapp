import {useCallback, useEffect, useRef} from 'react';
import {useSearchParams} from 'next/navigation';
import {useRouter} from 'next/router';
import {isAddress} from '@utils/tools.address';

import type {TDict} from '@yearn-finance/web-lib/types';

export function useQueryArg<T>(props: {
	key: string;
	type: 'string' | 'address' | 'array' | 'number';
	onChange: (value: string) => void;
}): (value: T) => Promise<void> {
	const router = useRouter();
	const searchParams = useSearchParams();
	const ran = useRef<boolean>(false);

	useEffect(() => {
		if (ran.current) {
			return;
		}
		if (!searchParams.has(props.key)) {
			return;
		}
		ran.current = true;
		const to = searchParams.get(props.key)?.split(',') || [];
		props.onChange(to[0]);
	}, [searchParams, props.onChange, props]);

	const onUpdateQueryArgs = useCallback(
		async (value: T): Promise<void> => {
			const queryArgs: TDict<string | string[] | undefined> = {};
			for (const key in router.query) {
				if (key !== props.key) {
					queryArgs[key] = router.query[key];
				}
			}

			const isInvalid = props.type === 'address' && !isAddress(value as string);
			if (!value || isInvalid) {
				queryArgs.search = undefined;
				delete queryArgs.search;
				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
				return;
			}
			queryArgs[props.key] = value as string;
			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
		},
		[props.key, props.type, router]
	);

	return onUpdateQueryArgs;
}
