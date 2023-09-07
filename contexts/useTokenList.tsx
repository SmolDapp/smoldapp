import React, {createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import defaultTokenList from 'utils/tokenLists.json';
import axios from 'axios';
import {Dialog, Transition} from '@headlessui/react';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {AxiosResponse} from 'axios';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

export type TTokenInfo = {
	extra?: boolean;
	chainId: number,
	address: TAddress,
	name: string,
	symbol: string,
	decimals: number,
	logoURI: string,
};
export type TTokenList = {
	name: string;
	description: string,
	timestamp: string,
	logoURI: string,
	uri: string,
	keywords: string[],
	version: {
		major: number,
		minor: number,
		patch: number,
	},
	tokens: TTokenInfo[];
}

export type TTokenListProps = {
	tokenList: TDict<TTokenInfo>,
	set_tokenList: Dispatch<SetStateAction<TDict<TTokenInfo>>>,
	openTokenListModal: () => void,
}
const defaultProps: TTokenListProps = {
	tokenList: {},
	set_tokenList: (): void => undefined,
	openTokenListModal: (): void => undefined
};

type TValue = {
	label: string,
	isValid: boolean | 'undetermined',
	list: TTokenList | undefined,
}
type TTokenListAddBox = {
	onAddTokenList: (list: TTokenList) => void
}
function TokenListAddBox({onAddTokenList}: TTokenListAddBox): React.ReactElement {
	const [value, set_value] = useState<TValue>({label: '', isValid: 'undetermined', list: undefined});
	const [isLoadingTokenList, set_isLoadingTokenList] = useState<boolean>(false);
	const currentLabel = useRef<string>('');

	const status = useMemo((): 'valid' | 'invalid' | 'warning' | 'pending' | 'none' => {
		if (value.isValid === true) {
			return 'valid';
		}
		if (value.isValid === false && value.label !== '' && !isLoadingTokenList) {
			return 'invalid';
		}
		if (isLoadingTokenList) {
			return 'pending';
		}
		return 'none';
	}, [value, isLoadingTokenList]);

	const onChange = useCallback(async (label: string): Promise<void> => {
		currentLabel.current = label;

		if (!label.endsWith('.json')) {
			return set_value({label, isValid: false, list: undefined});
		}

		performBatchedUpdates((): void => {
			set_value({label, isValid: 'undetermined', list: undefined});
			set_isLoadingTokenList(true);
		});

		const [fromLabel] = await Promise.allSettled([axios.get(label)]);
		if (fromLabel.status === 'fulfilled') {
			//Check if we got name, logoURI and tokens array
			const {name, logoURI, tokens} = fromLabel.value.data;
			if (name && logoURI && Array.isArray(tokens) && tokens.length > 0) {
				//Check if the tokens contains address, name, symbol, logoURI, chainId and decimals
				const areTokensValid = tokens.every((eachToken: TTokenInfo): boolean => {
					const {address, name, symbol, logoURI, chainId, decimals} = eachToken;
					return (Boolean(address && name !== undefined && symbol !== undefined && logoURI !== undefined && chainId && decimals));
				});
				performBatchedUpdates((): void => {
					if (currentLabel.current === label) {
						set_value({
							label,
							isValid: areTokensValid,
							list: {...fromLabel.value.data as TTokenList, uri: label}
						});
					}
					set_isLoadingTokenList(false);
				});
			}
		} else {
			performBatchedUpdates((): void => {
				if (currentLabel.current === label) {
					set_value({label, isValid: false, list: undefined});
				}
				set_isLoadingTokenList(false);
			});
		}
	}, [currentLabel]);

	const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (value.isValid === true && value.list) {
			onAddTokenList(value.list);
			set_value({label: '', isValid: 'undetermined', list: undefined});
		}
	}, [value, onAddTokenList]);

	return (
		<div className={'mt-4 px-4 md:mt-6 md:px-6'}>
			<div className={'rounded-md bg-primary-50 p-2 md:p-4'}>
				<p className={'text-sm text-neutral-700'}>
					{'The list of tokens displayed on smol is defined by the tokenlists. You can add a custom list to add any extra token. Existing list can be found '}
					<a href={'https://smold.app/tokenlistooor'} target={'_blank'} rel={'noreferrer'} className={'font-medium text-primary-900 hover:underline'}>
						{'here'}
					</a>
					{'.'}
				</p>
				<form
					onSubmit={onSubmit}
					className={'mt-4 flex flex-row gap-4'}>
					<div className={'smol--input-wrapper'}>
						<input
							aria-invalid={status === 'invalid'}
							onFocus={async (): Promise<void> => onChange(value.label)}
							onChange={async (e): Promise<void> => onChange(e.target.value)}
							value={value.label}
							required
							autoComplete={'off'}
							spellCheck={false}
							className={'smol--input pr-6'}
							type={'text'}
							placeholder={'https://...'} />
						<label
							className={status === 'invalid' || status === 'warning' ? 'relative' : 'pointer-events-none relative h-4 w-4'}>
							<span className={status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'}>
								<div className={'pointer-events-none relative h-4 w-4'}>
									<IconCheck
										className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${status === 'valid' ? 'opacity-100' : 'opacity-0'}`} />
									<IconCircleCross
										className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${status === 'invalid' ? 'opacity-100' : 'opacity-0'}`} />
									<div className={'absolute inset-0 flex items-center justify-center'}>
										<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${status === 'pending' ? 'opacity-100' : 'opacity-0'}`} />
									</div>
								</div>
								<span className={'tooltiptextsmall'}>
									{status === 'invalid' && 'This address is invalid'}
									{status === 'warning' && 'This address is already in use'}
								</span>
							</span>
						</label>
					</div>
					<div>
						<Button
							isDisabled={value.isValid !== true}
							className={'whitespace-nowrap'}>
							{'Add list'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

type TTokenListHandlerPopover = {
	lists: TTokenList[],
	onAddTokenList: (list: TTokenList) => void,
	isOpen: boolean,
	set_isOpen: Dispatch<SetStateAction<boolean>>,
}
function TokenListHandlerPopover({lists, onAddTokenList, isOpen, set_isOpen}: TTokenListHandlerPopover): React.ReactElement {
	const cancelButtonRef = useRef(null);

	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog as={'div'} className={'relative z-50'} initialFocus={cancelButtonRef} onClose={set_isOpen}>
				<Transition.Child
					as={Fragment}
					enter={'ease-out duration-300'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'ease-in duration-200'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'fixed inset-0 bg-neutral-900/20 transition-opacity'} />
				</Transition.Child>

				<div className={'fixed inset-0 z-10 w-screen overflow-y-auto'}>
					<div className={'flex min-h-full items-end justify-center p-4 text-center sm:items-start sm:p-0'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
							enterTo={'opacity-100 translate-y-0 sm:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
							leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
							<Dialog.Panel className={'relative rounded-lg bg-white pb-4 pt-5 text-left shadow-xl transition-all sm:my-24 sm:w-full sm:max-w-2xl'}>
								<div
									onClick={(): void => set_isOpen(false)}
									className={'absolute -right-2 -top-2'}>
									<div className={'group cursor-pointer rounded-full bg-white'}>
										<IconCircleCross className={'h-6 w-6 text-neutral-600 transition-colors hover:text-neutral-900'} aria-hidden={'true'} />
									</div>
								</div>

								<div className={'sm:flex sm:items-start'}>
									<div className={'mt-3 text-center sm:mt-0 sm:text-left'}>
										<Dialog.Title as={'h3'} className={'text-gray-900 px-4 text-base font-semibold leading-6 md:px-6'}>
											{'Manage your list of tokens'}
										</Dialog.Title>

										<TokenListAddBox onAddTokenList={onAddTokenList} />

										<div className={'scrollbar-show mt-2 max-h-[280px] overflow-y-scroll md:max-h-[420px]'}>
											{lists.map((eachList: TTokenList): ReactElement => (
												<div
													key={eachList.name}
													className={'relative flex w-full p-4 transition-colors hover:bg-neutral-50 md:px-6'}>
													<div className={'grid w-full grid-cols-12 items-center gap-4'}>
														<div className={'col-span-12 flex flex-row items-center space-x-6 md:col-span-8'}>
															<div className={'rounded-full border border-neutral-100'}>
																<ImageWithFallback
																	alt={eachList.name}
																	width={40}
																	height={40}
																	quality={90}
																	className={'w-10 min-w-[40px]'}
																	unoptimized
																	src={eachList.logoURI || ''} />
															</div>
															<div className={'text-left'}>
																<p className={'text-sm'}>
																	<span className={'font-medium'}>{eachList.name}</span>
																</p>
																<span className={'font-number mt-2 block !font-mono text-xxs text-neutral-600 transition-colors md:text-xs'}>
																	<a
																		href={eachList.uri}
																		target={'_blank'}
																		rel={'noreferrer'}
																		className={'cursor-alias font-mono hover:text-neutral-900 hover:underline'}>
																		{eachList.uri.split('/').pop()}
																	</a>
																	{` • ${eachList.tokens.length} tokens`}
																</span>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

const TokenList = createContext<TTokenListProps>(defaultProps);
export const TokenListContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {safeChainID} = useChainID();
	const [tokenList, set_tokenList] = useState<TDict<TTokenInfo>>({});
	const [lists, set_lists] = useState<TTokenList[]>([]);
	const [isTokenListModalOpen, set_isTokenListModalOpen] = useState<boolean>(false);

	const fetchTokensFromLists = useCallback(async (): Promise<void> => {
		const tokenListURIs = [
			`https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${safeChainID}/etherscan.json`,
			`https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${safeChainID}/yearn.json`,
			`https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${safeChainID}/tokenlistooor.json`
		];
		const [fromEtherscan, fromYearn, fromSmol] = await Promise.allSettled(tokenListURIs.map(async (eachURI: string): Promise<AxiosResponse> => axios.get(eachURI)));
		const tokens: TTokenInfo[] = [];
		const fromList: TTokenList[] = [];
		if (fromEtherscan.status === 'fulfilled') {
			tokens.push(...(fromEtherscan.value.data as TTokenList).tokens);
			fromList.push({...fromEtherscan.value.data as TTokenList, uri: tokenListURIs[0]});
		}
		if (fromYearn.status === 'fulfilled') {
			tokens.push(...(fromYearn.value.data as TTokenList).tokens);
			fromList.push({...fromYearn.value.data as TTokenList, uri: tokenListURIs[1]});
		}
		if (fromSmol.status === 'fulfilled') {
			tokens.push(...(fromSmol.value.data as TTokenList).tokens);
			fromList.push({...fromSmol.value.data as TTokenList, uri: tokenListURIs[2]});
		}

		const tokenListTokens: TDict<TTokenInfo> = {};
		const defaultList = defaultTokenList as Partial<TTokenList>;
		for (const eachToken of defaultList?.tokens || []) {
			if (!tokenListTokens[toAddress(eachToken.address)]) {
				tokenListTokens[toAddress(eachToken.address)] = eachToken;
			}
		}

		for (const eachToken of tokens) {
			if (!tokenListTokens[toAddress(eachToken.address)]) {
				tokenListTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		performBatchedUpdates((): void => {
			set_tokenList(tokenListTokens);
			set_lists(fromList);
		});
	}, [safeChainID]);

	useEffect((): void => {
		fetchTokensFromLists();
	}, [fetchTokensFromLists]);

	const contextValue = useMemo((): TTokenListProps => ({
		tokenList,
		set_tokenList,
		openTokenListModal: (): void => set_isTokenListModalOpen(true)
	}), [tokenList]);

	return (
		<TokenList.Provider value={contextValue}>
			{children}
			<TokenListHandlerPopover
				isOpen={isTokenListModalOpen}
				set_isOpen={set_isTokenListModalOpen}
				lists={lists}
				onAddTokenList={(list: TTokenList): void => {
					const tokenListTokens: TDict<TTokenInfo> = {};
					for (const eachToken of list.tokens) {
						if (!tokenListTokens[toAddress(eachToken.address)]) {
							tokenListTokens[toAddress(eachToken.address)] = eachToken;
						}
					}
					performBatchedUpdates((): void => {
						set_tokenList((prevTokenList: TDict<TTokenInfo>): TDict<TTokenInfo> => ({...prevTokenList, ...tokenListTokens}));
						set_lists((prevLists: TTokenList[]): TTokenList[] => ([...prevLists, list]));
					});
				}}/>
		</TokenList.Provider>
	);
};


export const useTokenList = (): TTokenListProps => useContext(TokenList);
