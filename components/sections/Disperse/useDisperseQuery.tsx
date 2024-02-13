import {createContext, useContext, useMemo} from 'react';
import {useRouter} from 'next/router';
import {useSyncUrlParams} from 'hooks/useSyncUrlParams';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {isString} from '@utils/types/typeGuards';
import {getStateFromUrlQuery} from '@utils/url/getStateFromUrlQuery';

import {useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';
import type {TDisperseQuery} from './useDisperse';

type TDisperseQueryManagement = {
	stateFromUrl: TDisperseQuery;
	initialStateFromUrl: TDisperseQuery | null;
};

const defaultProps = {
	stateFromUrl: {token: undefined, addresses: undefined, values: undefined},
	initialStateFromUrl: null
};

const DisperseQueryManagementContext = createContext<TDisperseQueryManagement>(defaultProps);

export const DisperseQueryManagement = ({
	children
}: {
	children: TOptionalRenderProps<TDisperseQueryManagement, ReactElement>;
}): ReactElement => {
	const {initialStateFromUrl, stateFromUrl} = useDisperseQuery();
	const {configuration} = useDisperse();

	/**
	 * Update the url query on every change in the UI
	 */
	useSyncUrlParams({
		token: configuration.tokenToSend?.address,
		addresses: configuration.inputs.map(input => input.receiver.address).filter(isString),
		values: configuration.inputs
			.map(input => (input.value.amount === '' ? undefined : input.value.normalizedBigAmount?.raw.toString()))
			.filter(isString)
	});

	const contextValue = useMemo(
		(): TDisperseQueryManagement => ({
			stateFromUrl,
			initialStateFromUrl
		}),
		[initialStateFromUrl, stateFromUrl]
	);

	return (
		<DisperseQueryManagementContext.Provider value={contextValue}>
			{optionalRenderProps(children, contextValue)}
		</DisperseQueryManagementContext.Provider>
	);
};

export function useDisperseQuery(): {initialStateFromUrl: TDisperseQuery | null; stateFromUrl: TDisperseQuery} {
	const router = useRouter();
	const searchParams = new URLSearchParams(router.asPath.split('?')[1]);

	const queryParams = Object.fromEntries(searchParams.entries());
	const stateFromUrl = getStateFromUrlQuery<TDisperseQuery>(queryParams, ({string, array}) => ({
		token: string('token'),
		addresses: array('addresses'),
		values: array('values')
	}));

	const initialStateFromUrl = useMemo(() => {
		return stateFromUrl;
	}, []);

	return {initialStateFromUrl, stateFromUrl};
}

export function useDisperseQueryManagement(): TDisperseQueryManagement {
	const ctx = useContext(DisperseQueryManagementContext);
	if (!ctx) {
		throw new Error('DisperseQueryManagement not found');
	}
	return ctx;
}
