import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Contract} from 'ethcall';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import * as format from '@yearn-finance/web-lib/utils/format';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import * as providers from '@yearn-finance/web-lib/utils/web3/providers';

import type {BigNumber, ethers} from 'ethers';
import type {DependencyList} from 'react';
import type {TDefaultStatus} from '@yearn-finance/web-lib/hooks/types';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

/* 🔵 - Yearn Finance **********************************************************
** Request, Response and helpers for the useBalances hook.
******************************************************************************/
export type	TMinBalanceData = {
	symbol: string,
	decimals: number,
	raw: BigNumber,
	normalized: number,
}
type	TDefaultReqArgs = {
	chainID?: number,
	provider?: ethers.providers.Provider,
}
export type	TUseBalancesTokens = {
	token: string,
	decimals: number,
	symbol?: string,
}
export type	TUseBalancesReq = {
	key?: string | number,
	tokens: TUseBalancesTokens[]
	effectDependencies?: DependencyList
} & TDefaultReqArgs

export type	TUseBalancesRes = {
	data: TDict<TMinBalanceData>,
	update: () => Promise<TDict<TMinBalanceData>>,
	updateSome: (token: TUseBalancesTokens[]) => Promise<TDict<TMinBalanceData>>,
	error?: Error,
	status: 'error' | 'loading' | 'success' | 'unknown',
	nonce: number
} & TDefaultStatus

type TDataRef = {
	nonce: number,
	address: TAddress,
	balances: TDict<TMinBalanceData>,
}

/* 🔵 - Yearn Finance **********************************************************
** Default status for the loading state.
******************************************************************************/
const		defaultStatus = {
	isLoading: false,
	isFetching: false,
	isSuccess: false,
	isError: false,
	isFetched: false,
	isRefetching: false
};

/* 🔵 - Yearn Finance ******************************************************
** This hook can be used to fetch balance information for any ERC20 tokens.
**************************************************************************/
export function	useBalances(props?: TUseBalancesReq): TUseBalancesRes {
	const	{address: web3Address, isActive, provider} = useWeb3();
	const	{chainID: web3ChainID} = useChainID();
	const	[nonce, set_nonce] = useState(0);
	const	[status, set_status] = useState<TDefaultStatus>(defaultStatus);
	const	[error, set_error] = useState<Error | undefined>(undefined);
	const	[balances, set_balances] = useState<TDict<TMinBalanceData>>({});
	const	data = useRef<TDataRef>({nonce: 0, address: toAddress(), balances: {}});

	/* 🔵 - Yearn Finance ******************************************************
	** When this hook is called, it will fetch the informations for the
	** specified list of tokens. If no props are specified, the default values
	** will be used.
	**************************************************************************/
	const stringifiedTokens = useMemo((): string => JSON.stringify(props?.tokens || []), [props?.tokens]);

	const getBalances = useCallback(async (tokenList: string): Promise<[TDict<TMinBalanceData>, Error | undefined]> => {
		const	tokens = JSON.parse(tokenList) || [];
		if (!isActive || !web3Address || tokens.length === 0) {
			return [{}, undefined];
		}

		let		currentProvider = provider || providers.getProvider(props?.chainID || web3ChainID || 1);
		if (props?.chainID && props.chainID !== web3ChainID) {
			currentProvider = providers.getProvider(props?.chainID);
		}

		const	calls = [];
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		for (const element of tokens) {
			const	{token} = element;
			const	ownerAddress = (element?.for || web3Address) as string;
			const	isEth = toAddress(token) === ETH_TOKEN_ADDRESS;
			if (isEth) {
				calls.push(ethcallProvider.getEthBalance(ownerAddress));
			} else {
				const	tokenContract = new Contract(token, ERC20_ABI);
				calls.push(tokenContract.balanceOf(ownerAddress));
			}
		}

		const	_data: TDict<TMinBalanceData> = {};
		try {
			const	results = await ethcallProvider.tryAll(calls);
			let		rIndex = 0;
			for (const element of tokens) {
				const	{token, decimals, symbol} = element;
				const	balanceOf = results[rIndex++] as BigNumber;
				_data[toAddress(token)] = {
					decimals: Number(decimals),
					symbol: symbol,
					raw: balanceOf,
					normalized: format.toNormalizedValue(balanceOf, Number(decimals))
				};
			}
			return [_data, undefined];
		} catch (_error) {
			return [{}, _error as Error];
		}
	}, [isActive, web3Address, props?.chainID, web3ChainID, provider]);

	const	onUpdate = useCallback(async (): Promise<TDict<TMinBalanceData>> => {
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});

		const	[newRawData, err] = await getBalances(stringifiedTokens);
		if (toAddress(web3Address as string) !== data.current.address) {
			data.current.balances = {};
		}
		data.current.address = toAddress(web3Address as string);

		for (const [address, element] of Object.entries(newRawData)) {
			data.current.balances[address] = {
				...data.current.balances[address],
				...element
			};
		}
		data.current.nonce += 1;

		performBatchedUpdates((): void => {
			set_nonce((n): number => n + 1);
			set_balances(data.current.balances);
			set_error(err as Error);
			set_status({...defaultStatus, isSuccess: true, isFetched: true});
		});
		return data.current.balances;
	}, [getBalances, stringifiedTokens, web3Address]);

	const	onUpdateSome = useCallback(async (tokenList: TUseBalancesTokens[]): Promise<TDict<TMinBalanceData>> => {
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});

		const	stringifiedSomeTokens = JSON.stringify(tokenList);
		const	[newRawData, err] = await getBalances(stringifiedSomeTokens);
		if (toAddress(web3Address as string) !== data.current.address) {
			data.current.balances = {};
		}
		data.current.address = toAddress(web3Address as string);

		for (const [address, element] of Object.entries(newRawData)) {
			data.current.balances[address] = {
				...data.current.balances[address],
				...element
			};
		}
		data.current.nonce += 1;

		performBatchedUpdates((): void => {
			set_nonce((n): number => n + 1);
			set_balances(data.current.balances);
			set_error(err as Error);
			set_status({...defaultStatus, isSuccess: true, isFetched: true});
		});
		return data.current.balances;
	}, [getBalances, web3Address]);

	useEffect((): void => {
		onUpdate();
	}, [onUpdate]);

	const	contextValue = useMemo((): TUseBalancesRes => ({
		data: balances,
		nonce,
		update: onUpdate,
		updateSome: onUpdateSome,
		error,
		isLoading: status.isLoading,
		isFetching: status.isFetching,
		isSuccess: status.isSuccess,
		isError: status.isError,
		isFetched: status.isFetched,
		isRefetching: status.isRefetching,
		status: (
			status.isError ? 'error' :
				(status.isLoading || status.isFetching) ? 'loading' :
					(status.isSuccess) ? 'success' : 'unknown'
		)
	}), [balances, error, nonce, onUpdate, onUpdateSome, status.isError, status.isFetched, status.isFetching, status.isLoading, status.isRefetching, status.isSuccess]);

	return (contextValue);
}
