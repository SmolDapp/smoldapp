import {createContext, useContext, useEffect, useMemo} from 'react';
import {useRouter} from 'next/router';
import {useValidateAddressInput} from 'components/designSystem/SmolAddressInput';
import {useValidateAmountInput} from 'components/designSystem/SmolTokenAmountInput';
import {useSyncUrlParams} from 'hooks/useSyncUrlParams';
import {useBalances} from '@builtbymom/web3/hooks/useBalances.multichains';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, toNormalizedBN} from '@builtbymom/web3/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {isString} from '@utils/types/typeGuards';
import {getStateFromUrlQuery} from '@utils/url/getStateFromUrlQuery';

import {newVoidRow, useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';
import type {TDisperseInput, TDisperseQuery} from './useDisperse';

type TDisperseQueryManagement = {
	stateFromUrl: TDisperseQuery;
	initialStateFromUrl: TDisperseQuery | null;
	hasInitialInputs: boolean;
};

const defaultProps = {
	stateFromUrl: {token: undefined, addresses: undefined, values: undefined},
	initialStateFromUrl: null,
	hasInitialInputs: false
};

const DisperseQueryManagementContext = createContext<TDisperseQueryManagement>(defaultProps);

export const DisperseQueryManagement = ({
	children
}: {
	children: TOptionalRenderProps<TDisperseQueryManagement, ReactElement>;
}): ReactElement => {
	const {initialStateFromUrl, stateFromUrl, hasInitialInputs} = useDisperseQuery();
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
			initialStateFromUrl,
			hasInitialInputs
		}),
		[hasInitialInputs, initialStateFromUrl, stateFromUrl]
	);

	return (
		<DisperseQueryManagementContext.Provider value={contextValue}>
			{optionalRenderProps(children, contextValue)}
		</DisperseQueryManagementContext.Provider>
	);
};

export function useDisperseQuery(): {
	initialStateFromUrl: TDisperseQuery | null;
	stateFromUrl: TDisperseQuery;
	hasInitialInputs: boolean;
} {
	const {safeChainID} = useChainID();
	const {dispatchConfiguration} = useDisperse();

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const hasInitialInputs = Array.isArray(initialStateFromUrl.addresses) || Array.isArray(initialStateFromUrl.values);

	/** Token in URL may not be present in token list, so better to be fetched  */
	const {data: initialTokenRaw} = useBalances({
		tokens: [{address: toAddress(initialStateFromUrl?.token), chainID: safeChainID}]
	});

	const initialToken =
		initialTokenRaw[safeChainID] && initialStateFromUrl?.token
			? initialTokenRaw[safeChainID][initialStateFromUrl?.token]
			: undefined;

	const onSelectToken = (token: TToken): void => {
		dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: token});
	};

	const onAddInputs = (inputs: TDisperseInput[]): void => {
		dispatchConfiguration({type: 'ADD_RECEIVERS', payload: inputs});
	};

	const getInitialAmount = (index: number, token: TToken | undefined): string => {
		return initialStateFromUrl?.values?.[index] && token
			? toNormalizedBN(initialStateFromUrl?.values[index], token.decimals).display
			: '0';
	};

	/** Set initial token from url if present */
	useEffect(() => {
		if (initialToken) {
			onSelectToken(initialToken);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialToken]);

	const {validate: validateAddress} = useValidateAddressInput();
	const {validate: validateAmount} = useValidateAmountInput();

	/** Add inputs with inital validated values */
	useUpdateEffect(() => {
		if (!Array.isArray(initialStateFromUrl.addresses)) {
			return;
		}

		const result: TDisperseInput[] = [];

		const promises = initialStateFromUrl.addresses.map(async address => validateAddress(undefined, address));
		Promise.all(promises)
			.then(values => {
				values.forEach((validatedReceiver, index) => {
					const stringAmount = getInitialAmount(index, initialToken);
					const value = {
						receiver: validatedReceiver,
						value: {...newVoidRow().value, ...validateAmount(stringAmount, initialToken)},
						UUID: crypto.randomUUID()
					};
					result.push(value);
				});
			})
			.finally(() => onAddInputs(result));
	}, [initialToken]);

	return {initialStateFromUrl, stateFromUrl, hasInitialInputs};
}

export function useDisperseQueryManagement(): TDisperseQueryManagement {
	const ctx = useContext(DisperseQueryManagementContext);
	if (!ctx) {
		throw new Error('DisperseQueryManagement not found');
	}
	return ctx;
}
