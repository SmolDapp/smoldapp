import {useMemo} from 'react';

import type {TToken} from '@utils/types/types';

function useFilterTokens(tokens: TToken[], query: string): TToken[] {
	const filteredTokens = useMemo((): TToken[] => {
		if (query === '' || tokens.length === 0) {
			return tokens;
		}
		return tokens.filter(
			(token): boolean =>
				token.name.toLowerCase().startsWith(query.toLowerCase()) ||
				token.symbol.toLowerCase().startsWith(query.toLowerCase()) ||
				token.address.toLowerCase().startsWith(query.toLowerCase())
		);
	}, [query, tokens]);
	return filteredTokens;
}

export {useFilterTokens};
