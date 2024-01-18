import {createContext, useContext, useMemo} from 'react';
import {useRouter} from 'next/router';
import {useSendFlow} from 'components/sections/Send/useSendFlow';
import {useSyncUrlParams} from 'hooks/useSyncUrlParams';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {isString} from '@utils/types/typeGuards';
import {getStateFromUrlQuery} from '@utils/url/getStateFromUrlQuery';

import type {TSendQuery} from 'components/sections/Send/useSendFlow';
import type {ReactElement} from 'react';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';

type TSendQueryManagement = {
	stateFromUrl: TSendQuery;
	initialStateFromUrl: TSendQuery | null;
};

const defaultProps = {
	stateFromUrl: {to: undefined, tokens: undefined, values: undefined},
	initialStateFromUrl: null
};

const SendQueryManagementContext = createContext<TSendQueryManagement>(defaultProps);

export const SendQueryManagement = ({
	children
}: {
	children: TOptionalRenderProps<TSendQueryManagement, ReactElement>;
}): ReactElement => {
	const {initialStateFromUrl, stateFromUrl} = useSendQuery();
	const {configuration} = useSendFlow();

	/**
	 * Update the url query on every change in the UI
	 */
	useSyncUrlParams({
		to: configuration.receiver.address,
		tokens: configuration.inputs.map(input => input.token?.address).filter(isString),
		values: configuration.inputs
			.map(input => (input.amount === '' ? undefined : input.normalizedBigAmount?.raw.toString()))
			.filter(isString)
	});

	const contextValue = useMemo(
		(): TSendQueryManagement => ({
			stateFromUrl,
			initialStateFromUrl
		}),
		[initialStateFromUrl, stateFromUrl]
	);

	return (
		<SendQueryManagementContext.Provider value={contextValue}>
			{optionalRenderProps(children, contextValue)}
		</SendQueryManagementContext.Provider>
	);
};

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

export function useSendQueryManagement(): TSendQueryManagement {
	const ctx = useContext(SendQueryManagementContext);
	if (!ctx) {
		throw new Error('SendQueryManagementContext not found');
	}
	return ctx;
}
