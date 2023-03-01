import React, {Fragment, useMemo, useState} from 'react';
import {ImageWithFallback} from 'components/ImageWithFallback';
import {removeTokenFromList} from 'utils/actions/removeTokenFromList';
import {Menu, Transition} from '@headlessui/react';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconCopy from '@yearn-finance/web-lib/icons/IconCopy';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TToken = {
	address: string;
	name: string;
	symbol: string;
	logoURI: string;
	chainID: number;
	decimals: number;
}

type TTokenItem = {
	isListooor: boolean,
	token: TToken,
	listAddress: TAddress,
	explorer: string,
	onSuccess: VoidFunction
}
function	TokenItem({isListooor, token, listAddress, explorer, onSuccess}: TTokenItem): ReactElement {
	const	{provider} = useWeb3();
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);

	async function	onRemoveToken(addr: string): Promise<void> {
		if (!txStatus.none) {
			return;
		}
		new Transaction(provider, removeTokenFromList, set_txStatus).populate(
			toAddress(listAddress),
			toAddress(addr)
		).onSuccess(async (): Promise<void> => {
			onSuccess();
		}).perform();
	}

	return (
		<div className={'box-0 flex p-6'}>
			<div className={'grid w-full grid-cols-12 items-center justify-center'}>
				<div className={'col-span-1'}>
					<ImageWithFallback
						alt={''}
						width={42}
						height={42}
						quality={90}
						src={token.logoURI}
						unoptimized />
				</div>
				<div className={'col-span-7'}>
					<p className={'text-sm text-neutral-500'}>
						<span className={'text-base font-medium text-neutral-900'}>
							{token.name}
						</span>
						{` - ${token.symbol}`}
					</p>
					<span className={'flex flex-row items-center space-x-2'}>
						<p
							className={'font-number text-sm text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
							{token.address}
						</p>
						<a
							href={`${explorer}/address/${token.address}`}
							target={'_blank'}
							rel={'noreferrer'}>
							<IconLinkOut className={'h-3 w-3 cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900'} />
						</a>
						<button onClick={(): void => copyToClipboard(token.address)}>
							<IconCopy className={'h-3 w-3 cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900'} />
						</button>
					</span>
				</div>
				<div className={'col-span-2'}>
					<p className={'text-sm text-neutral-500'}>
						<span className={'text-sm'}>{'Decimals'}</span>
					</p>
					<p className={'font-number text-sm font-medium text-neutral-900'}>
						{token.decimals}
					</p>
				</div>
				<div className={`col-span-2 flex w-full justify-end ${isListooor ? '' : 'hidden'}`}>
					<Menu as={'div'} className={'relative inline-block text-left'}>
						<Menu.Button
							className={'cursor-pointer rounded-full bg-neutral-100 p-2 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900'}>
							<svg
								className={'h-3 w-3'}
								xmlns={'http://www.w3.org/2000/svg'}
								viewBox={'0 0 320 512'}>
								<path d={'M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z'} fill={'currentColor'}/>
							</svg>
						</Menu.Button>
						<Transition
							as={Fragment}
							enter={'transition ease-out duration-100'}
							enterFrom={'transform opacity-0 scale-95'}
							enterTo={'transform opacity-100 scale-100'}
							leave={'transition ease-in duration-75'}
							leaveFrom={'transform opacity-100 scale-100'}
							leaveTo={'transform opacity-0 scale-95'}>
							<Menu.Items className={'absolute right-0 mt-2 w-40 origin-top-right rounded-sm border border-neutral-200 bg-neutral-0 shadow-lg'}>
								<Menu.Item>
									<button
										disabled={!txStatus.none || !isListooor}
										onClick={async (): Promise<void> => onRemoveToken(token.address)}
										className={'w-full px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900'}>
										{'Remove from list'}
									</button>
								</Menu.Item>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>
		</div>
	);
}

type TListOfTokens = {
	isListooor: boolean,
	tokens: TToken[],
	listAddress: TAddress,
	chainID: number,
	onRemoveSuccess: VoidFunction
};
function	ListOfTokens({isListooor, tokens, listAddress, chainID, onRemoveSuccess}: TListOfTokens): ReactElement {
	const	chain = useChain();
	const	explorer = useMemo((): string => chain.get(chainID)?.block_explorer || 'https://etherscan.io', [chainID, chain]);

	return (
		<div className={'mt-4 grid gap-4'}>
			{tokens.map((token: TToken): ReactElement => (
				<TokenItem
					key={token.address}
					isListooor={isListooor}
					listAddress={listAddress}
					token={token}
					explorer={explorer}
					onSuccess={onRemoveSuccess} />
			))}
		</div>
	);
}

export default ListOfTokens;
