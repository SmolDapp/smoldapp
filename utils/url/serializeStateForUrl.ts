import {isNonNullable} from '@utils/types/typeGuards';

/**
 * Converts a state object into a query params string that can be used in an URL.
 *
 * It is a generic helper.
 */
export function serializeSearchStateForUrl(
	state: {[key: string]: unknown},
	/**
	 * These keys will always be serialized, even if they have a falsy value.
	 */
	forceSerializeKeys: string[] = []
): string {
	const mappedStateEntries = Object.entries(state).map(([key, value]) => {
		if (!value && !forceSerializeKeys.includes(key)) {
			return undefined;
		}

		if (Array.isArray(value)) {
			if (value.length === 0) {
				return undefined;
			}
			if (!['string', 'number', 'bigint', 'boolean'].includes(typeof value[0])) {
				return undefined;
			}
			return `${key}=${value.join(',')}`;
		}

		return `${key}=${value}`;
	});

	const filteredStateEntries = mappedStateEntries.filter(isNonNullable);

	return encodeURI(filteredStateEntries.join('&'));
}
