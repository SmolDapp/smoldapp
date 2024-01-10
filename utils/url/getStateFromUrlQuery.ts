import {getParamFromUrlQuery} from './getParamFromUrlQuery';

import type {ParsedUrlQuery} from 'querystring';
import type {TPartialExhaustive} from '@utils/types/types';

/**
 * Uses the `getParamFromUrl` helpers to get state value from URL query params based on a state schema.
 *
 */
export function getStateFromUrlQuery<TState>(
	query: ParsedUrlQuery,
	callback: (helpers: ReturnType<typeof getParamFromUrlQuery>) => TPartialExhaustive<TState>
): Partial<TState> {
	return callback(getParamFromUrlQuery(query));
}
