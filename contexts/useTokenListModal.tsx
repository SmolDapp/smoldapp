'use client';

import React, {createContext, useContext, useState} from 'react';
import axios from 'axios';
import {useAsyncTrigger} from '@builtbymom/web3/hooks/useAsyncTrigger';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, zeroNormalizedBN} from '@builtbymom/web3/utils';
import {useLocalStorageValue} from '@react-hookz/web';
import {TokenListHandlerPopover} from '@common/TokenList/TokenListHandlerPopover';

import type {AxiosResponse} from 'axios';
import type {TDict, TToken, TTokenList} from '@builtbymom/web3/types';

const customDefaultList = {
	name: 'Custom',
	description: 'Custom token list',
	timestamp: new Date().toISOString(),
	logoURI: '',
	uri: '',
	keywords: [],
	version: {
		major: 1,
		minor: 0,
		patch: 0
	},
	tokens: []
};

export type TTokenListModalProps = {
	openTokenListModal: () => void;
};
const defaultProps: TTokenListModalProps = {
	openTokenListModal: (): void => undefined
};

const TokenListModal = createContext<TTokenListModalProps>(defaultProps);
export const TokenListModalContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {safeChainID} = useChainID();
	const {value: extraTokenlist, set: set_extraTokenlist} = useLocalStorageValue<string[]>('extraTokenlists');
	const {value: extraTokens, set: set_extraTokens} = useLocalStorageValue<TTokenList['tokens']>('extraTokens');
	const [lists, set_lists] = useState<TTokenList[]>([]);
	const [extraLists, set_extraLists] = useState<TTokenList[]>([]);
	const [customLists, set_customLists] = useState<TTokenList>(customDefaultList);
	const [isTokenListModalOpen, set_isTokenListModalOpen] = useState<boolean>(false);

	useAsyncTrigger(async (): Promise<void> => {
		const rootURI = `https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${safeChainID}`;
		const tokenListURIs = [`${rootURI}/etherscan.json`, `${rootURI}/tokenlistooor.json`];
		const [fromEtherscan, fromSmol] = await Promise.allSettled(
			tokenListURIs.map(async (eachURI: string): Promise<AxiosResponse> => axios.get(eachURI))
		);
		const tokens: TTokenList['tokens'] = [];
		const fromList: TTokenList[] = [];
		if (fromEtherscan.status === 'fulfilled' && fromEtherscan.value.data?.tokens) {
			tokens.push(...(fromEtherscan.value.data as TTokenList).tokens);
			fromList.push({...(fromEtherscan.value.data as TTokenList), uri: tokenListURIs[0]});
		}
		if (fromSmol.status === 'fulfilled' && fromSmol.value.data?.tokens) {
			tokens.push(...(fromSmol.value.data as TTokenList).tokens);
			fromList.push({...(fromSmol.value.data as TTokenList), uri: tokenListURIs[1]});
		}

		const tokenListTokens: TDict<TToken> = {};
		for (const eachToken of tokens) {
			if (!tokenListTokens[toAddress(eachToken.address)]) {
				tokenListTokens[toAddress(eachToken.address)] = {
					address: eachToken.address,
					name: eachToken.name,
					symbol: eachToken.symbol,
					decimals: eachToken.decimals,
					chainID: eachToken.chainId,
					logoURI: eachToken.logoURI,
					value: 0,
					price: zeroNormalizedBN,
					balance: zeroNormalizedBN
				};
			}
		}
		set_lists(fromList);
	}, [safeChainID]);

	useAsyncTrigger(async (): Promise<void> => {
		const tokenListTokens: TDict<TToken> = {};
		const fromList: TTokenList[] = [];
		for (const eachURI of extraTokenlist || []) {
			const [fromUserList] = await Promise.allSettled([axios.get(eachURI)]);
			if (fromUserList.status === 'fulfilled') {
				fromList.push({...(fromUserList.value.data as TTokenList), uri: eachURI});
				const {tokens} = fromUserList.value.data;
				for (const eachToken of tokens) {
					if (!tokenListTokens[toAddress(eachToken.address)]) {
						tokenListTokens[toAddress(eachToken.address)] = {
							address: eachToken.address,
							name: eachToken.name,
							symbol: eachToken.symbol,
							decimals: eachToken.decimals,
							chainID: eachToken.chainId,
							logoURI: eachToken.logoURI,
							value: 0,
							price: zeroNormalizedBN,
							balance: zeroNormalizedBN
						};
					}
				}
			}
		}
		set_extraLists(fromList);
	}, [extraTokenlist]);

	useAsyncTrigger(async (): Promise<void> => {
		if (extraTokens === undefined) {
			return;
		}
		if ((extraTokens || []).length > 0) {
			const tokenListTokens: TDict<TToken> = {};
			for (const eachToken of extraTokens || []) {
				if (!tokenListTokens[toAddress(eachToken.address)]) {
					tokenListTokens[toAddress(eachToken.address)] = {
						address: eachToken.address,
						name: eachToken.name,
						symbol: eachToken.symbol,
						decimals: eachToken.decimals,
						chainID: eachToken.chainId,
						logoURI: eachToken.logoURI,
						value: 0,
						price: zeroNormalizedBN,
						balance: zeroNormalizedBN
					};
				}
			}
			set_customLists({...customDefaultList, tokens: extraTokens});
		}
	}, [extraTokens]);

	return (
		<TokenListModal.Provider value={{openTokenListModal: (): void => set_isTokenListModalOpen(true)}}>
			{children}
			<TokenListHandlerPopover
				isOpen={isTokenListModalOpen}
				set_isOpen={set_isTokenListModalOpen}
				lists={[...lists, ...extraLists, customLists]}
				onAddTokenList={(list: TTokenList): void => {
					const tokenListTokens: TDict<TToken> = {};
					for (const eachToken of list.tokens) {
						if (!tokenListTokens[toAddress(eachToken.address)]) {
							tokenListTokens[toAddress(eachToken.address)] = {
								address: eachToken.address,
								name: eachToken.name,
								symbol: eachToken.symbol,
								decimals: eachToken.decimals,
								chainID: eachToken.chainId,
								logoURI: eachToken.logoURI,
								value: 0,
								price: zeroNormalizedBN,
								balance: zeroNormalizedBN
							};
						}
					}
					set_lists((prevLists: TTokenList[]): TTokenList[] => [...prevLists, list]);
					set_extraTokenlist([...(extraTokenlist || []), list.uri]);
				}}
				onAddToken={(newToken: TToken): void => {
					set_extraTokens([
						...(extraTokens || []),
						{
							address: newToken.address,
							name: newToken.name,
							symbol: newToken.symbol,
							decimals: newToken.decimals,
							logoURI: newToken.logoURI,
							chainId: newToken.chainID
						}
					]);
				}}
			/>
		</TokenListModal.Provider>
	);
};

export const useTokenListModal = (): TTokenListModalProps => useContext(TokenListModal);
