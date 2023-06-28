import {useCallback, useMemo, useRef, useState} from 'react';
import {erc20ABI} from 'wagmi';
import axios from 'axios';
import {useUpdateEffect} from '@react-hookz/web';
import {deserialize, multicall} from '@wagmi/core';
import {useUI} from '@yearn-finance/web-lib/contexts/useUI';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import AGGREGATE3_ABI from '@yearn-finance/web-lib/utils/abi/aggregate.abi';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, MULTICALL3_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {decodeAsBigInt} from '@yearn-finance/web-lib/utils/decoder';
import * as format from '@yearn-finance/web-lib/utils/format';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {AxiosResponse} from 'axios';
import type {TGetBatchBalancesResp} from 'pages/api/getBatchBalances';
import type {DependencyList} from 'react';
import type {ContractFunctionConfig} from 'viem';
import type {Connector} from 'wagmi';
import type {TAddress, TDict, TNDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData, TDefaultStatus} from '@yearn-finance/web-lib/types/hooks';

/* 🔵 - Yearn Finance **********************************************************
** Request, Response and helpers for the useBalances hook.
******************************************************************************/
type TDefaultReqArgs = {
	chainID?: number,
	provider?: Connector,
}
export type TUseBalancesTokens = {
	token: TAddress,
	decimals: number,
	symbol: string,
	name: string,
	force?: boolean
}
export type TUseBalancesReq = {
	key?: string | number,
	tokens: TUseBalancesTokens[]
	effectDependencies?: DependencyList
} & TDefaultReqArgs

export type TUseBalancesRes = {
	data: TNDict<TDict<TBalanceData>>,
	update: () => Promise<TDict<TBalanceData>>,
	updateSome: (token: TUseBalancesTokens[]) => Promise<TDict<TBalanceData>>,
	error?: Error,
	status: 'error' | 'loading' | 'success' | 'unknown',
	nonce: number
} & TDefaultStatus

type TDataRef = {
	nonce: number,
	address: TAddress,
	balances: TDict<TBalanceData>,
}

/* 🔵 - Yearn Finance **********************************************************
** Default status for the loading state.
******************************************************************************/
const defaultStatus = {
	isLoading: false,
	isFetching: false,
	isSuccess: false,
	isError: false,
	isFetched: false,
	isRefetching: false
};

async function performCall(
	chainID: number,
	calls: ContractFunctionConfig[],
	tokens: TUseBalancesTokens[]
): Promise<[TDict<TBalanceData>, Error | undefined]> {
	const _data: TDict<TBalanceData> = {};
	const results = await multicall({contracts: calls as never[], chainId: chainID});

	let rIndex = 0;
	for (const element of tokens) {
		const {token, symbol, name, decimals} = element;
		const balanceOf = decodeAsBigInt(results[rIndex++]);
		_data[toAddress(token)] = {
			decimals: Number(decimals || 18),
			symbol: symbol,
			name: name,
			raw: balanceOf,
			normalized: format.toNormalizedValue(balanceOf, Number(decimals || 18))
		};
	}
	return [_data, undefined];
}

async function getBalances(
	chainID: number,
	address: TAddress,
	tokens: TUseBalancesTokens[]
): Promise<[TDict<TBalanceData>, Error | undefined]> {
	let result: TDict<TBalanceData> = {};
	const calls: ContractFunctionConfig[] = [];
	for (const element of tokens) {
		const {token} = element;
		const ownerAddress = address;
		const isEth = toAddress(token) === toAddress(ETH_TOKEN_ADDRESS);
		if (isEth) {
			calls.push({address: MULTICALL3_ADDRESS, abi: AGGREGATE3_ABI, functionName: 'getEthBalance', args: [ownerAddress]});
		} else {
			calls.push({address: token, abi: erc20ABI, functionName: 'balanceOf', args: [ownerAddress]});
		}
	}

	try {
		const [callResult] = await performCall(chainID, calls, tokens);
		result = {...result, ...callResult};
	} catch (_error) {
		console.error(_error);
	}
	return [result, undefined];
}


/* 🔵 - Yearn Finance ******************************************************
** This hook can be used to fetch balance information for any ERC20 tokens.
**************************************************************************/
export function useBalances(props?: TUseBalancesReq): TUseBalancesRes {
	const {address: web3Address, isActive, provider, chainID: web3ChainID} = useWeb3();
	const {onLoadStart, onLoadDone} = useUI();
	const [nonce, set_nonce] = useState(0);
	const [status, set_status] = useState<TDefaultStatus>(defaultStatus);
	const [error, set_error] = useState<Error | undefined>(undefined);
	const [balances, set_balances] = useState<TNDict<TDict<TBalanceData>>>({});
	const data = useRef<TNDict<TDataRef>>({1: {nonce: 0, address: toAddress(), balances: {}}});
	const stringifiedTokens = useMemo((): string => JSON.stringify(props?.tokens || []), [props?.tokens]);

	const updateBalancesCall = useCallback((chainID: number, newRawData: TDict<TBalanceData>): TDict<TBalanceData> => {
		if (toAddress(web3Address as string) !== data?.current?.[chainID]?.address) {
			data.current[chainID] = {
				address: toAddress(web3Address as string),
				balances: {},
				nonce: 0
			};
		}
		data.current[chainID].address = toAddress(web3Address as string);

		for (const [address, element] of Object.entries(newRawData)) {
			element.raw = element.raw || 0n;
			data.current[chainID].balances[address] = {
				...data.current[chainID].balances[address],
				...element
			};
		}
		data.current[chainID].nonce += 1;

		performBatchedUpdates((): void => {
			set_balances((b): TNDict<TDict<TBalanceData>> => ({
				...b,
				[chainID]: {
					...(b[chainID] || {}),
					...data.current[chainID].balances
				}
			}));
			set_nonce((n): number => n + 1);
			set_status({...defaultStatus, isSuccess: true, isFetched: true});
		});
		onLoadDone();

		return data.current[chainID].balances;
	}, [onLoadDone, web3Address]);

	/* 🔵 - Yearn Finance ******************************************************
	** onUpdate will take the stringified tokens and fetch the balances for each
	** token. It will then update the balances state with the new balances.
	** This takes the whole list and is not optimized for performance, aka not
	** send in a worker.
	**************************************************************************/
	const onUpdate = useCallback(async (): Promise<TDict<TBalanceData>> => {
		if (!isActive || !web3Address || !provider) {
			return {};
		}
		const tokenList = JSON.parse(stringifiedTokens) || [];
		const tokens = tokenList.filter(({token}: TUseBalancesTokens): boolean => !isZeroAddress(token));
		if (tokens.length === 0) {
			return {};
		}
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});
		onLoadStart();

		const chunks = [];
		for (let i = 0; i < tokens.length; i += 5_000) {
			chunks.push(tokens.slice(i, i + 5_000));
		}

		for (const chunkTokens of chunks) {
			const [newRawData, err] = await getBalances((props?.chainID || web3ChainID || 1), web3Address, chunkTokens);
			if (toAddress(web3Address as string) !== data?.current?.[web3ChainID]?.address) {
				data.current[web3ChainID] = {
					address: toAddress(web3Address as string),
					balances: {},
					nonce: 0
				};
			}
			data.current[web3ChainID].address = toAddress(web3Address as string);

			for (const [address, element] of Object.entries(newRawData)) {
				data.current[web3ChainID].balances[address] = {
					...data.current[web3ChainID].balances[address],
					...element
				};
			}
			data.current[web3ChainID].nonce += 1;

			performBatchedUpdates((): void => {
				set_balances((b): TNDict<TDict<TBalanceData>> => ({
					...b,
					[web3ChainID]: {
						...(b[web3ChainID] || {}),
						...data.current[web3ChainID].balances
					}
				}));
				set_nonce((n): number => n + 1);
				set_error(err as Error);
				set_status({...defaultStatus, isSuccess: true, isFetched: true});
			});
		}
		onLoadDone();

		return data.current[web3ChainID].balances;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive, props?.chainID, provider, stringifiedTokens, web3Address, web3ChainID]);

	/* 🔵 - Yearn Finance ******************************************************
	** onUpdateSome takes a list of tokens and fetches the balances for each
	** token. Even if it's not optimized for performance, it should not be an
	** issue as it should only be used for a little list of tokens.
	**************************************************************************/
	const onUpdateSome = useCallback(async (tokenList: TUseBalancesTokens[]): Promise<TDict<TBalanceData>> => {
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});
		onLoadStart();
		const tokens = tokenList.filter(({token}: TUseBalancesTokens): boolean => !isZeroAddress(token));

		const chunks = [];
		for (let i = 0; i < tokens.length; i += 2_000) {
			chunks.push(tokens.slice(i, i + 2_000));
		}

		const tokensAdded: TDict<TBalanceData> = {};
		for (const chunkTokens of chunks) {
			const [newRawData, err] = await getBalances((props?.chainID || web3ChainID || 1), toAddress(web3Address as string), chunkTokens);
			if (toAddress(web3Address as string) !== data?.current?.[web3ChainID]?.address) {
				data.current[web3ChainID] = {
					address: toAddress(web3Address as string),
					balances: {},
					nonce: 0
				};
			}
			data.current[web3ChainID].address = toAddress(web3Address as string);

			for (const [address, element] of Object.entries(newRawData)) {
				tokensAdded[address] = element;
				data.current[web3ChainID].balances[address] = {
					...data.current[web3ChainID].balances[address],
					...element
				};
			}
			data.current[web3ChainID].nonce += 1;

			performBatchedUpdates((): void => {
				set_balances((b): TNDict<TDict<TBalanceData>> => ({
					...b,
					[web3ChainID]: {
						...(b[web3ChainID] || {}),
						...data.current[web3ChainID].balances
					}
				}));
				set_nonce((n): number => n + 1);
				set_error(err as Error);
				set_status({...defaultStatus, isSuccess: true, isFetched: true});
			});
		}
		onLoadDone();
		return tokensAdded;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.chainID, provider, web3Address, web3ChainID]);

	/* 🔵 - Yearn Finance ******************************************************
	** Everytime the stringifiedTokens change, we need to update the balances.
	** This is the main hook and is optimized for performance, using a worker
	** to fetch the balances, preventing the UI to freeze.
	**************************************************************************/
	useUpdateEffect((): void => {
		if (!isActive || !web3Address || !provider) {
			return;
		}
		set_status({...defaultStatus, isLoading: true, isFetching: true, isRefetching: defaultStatus.isFetched});
		onLoadStart();

		const tokens = JSON.parse(stringifiedTokens) || [];
		const chainID = props?.chainID || web3ChainID || 1;
		const chunks = [];
		for (let i = 0; i < tokens.length; i += 500) {
			chunks.push(tokens.slice(i, i + 500));
		}
		for (const chunkTokens of chunks) {
			axios.post('/api/getBatchBalances', {chainID, address: web3Address, tokens: chunkTokens})
				.then((res: AxiosResponse<TGetBatchBalancesResp>): void => {
					updateBalancesCall(res.data.chainID, deserialize(res.data.balances));
				})
				.catch((err): void => {
					console.error(err);
					onLoadDone();
					onUpdateSome(chunkTokens);
				});
		}
	}, [stringifiedTokens, isActive, web3Address]);

	const contextValue = useMemo((): TUseBalancesRes => ({
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
