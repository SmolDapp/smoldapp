import {useRouter} from 'next/router';
import {useDeepCompareEffect} from '@react-hookz/web';
import {getPathWithoutQueryParams} from '@utils/url/getPathWithoutQueryParams';
import {serializeSearchStateForUrl} from '@utils/url/serializeStateForUrl';

export function useSyncUrlParams(
	state: {[key: string]: unknown},
	options?: {
		/**
		 * These keys will always be serialized, even if they have a falsy value.
		 */
		forceSerializeKeys: string[];
	}
): void {
	const {forceSerializeKeys = []} = options ?? {};

	const router = useRouter();
	useDeepCompareEffect(() => {
		router.push(
			{
				pathname: getPathWithoutQueryParams(router.asPath),
				query: serializeSearchStateForUrl({...state}, forceSerializeKeys)
			},
			undefined,
			{
				scroll: false,
				shallow: true
			}
		);
	}, [forceSerializeKeys, router.isReady, state]);
}
