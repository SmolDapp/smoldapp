import React, {useCallback, useState} from 'react';
import AddTokenInput from 'apps/tokenlistooor/components/AddTokenInput';
import {addBatchTokensToList} from 'utils/actions/addBatchTokensToList';
import {addTokenToList} from 'utils/actions/addTokenToList';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
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

type TViewAddTokensProps = {
	listAddress: TAddress,
	tokensInList: TToken[],
	onSuccess: VoidFunction
}
function	ViewAddTokens({listAddress, tokensInList, onSuccess}: TViewAddTokensProps): ReactElement {
	const	{provider} = useWeb3();
	const	[tokens, set_tokens] = useState<string[]>(['']);
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);
	const	[nonce, set_nonce] = useState(0);

	const onAddToken = useCallback(async (addr: string): Promise<void> => {
		new Transaction(provider, addTokenToList, set_txStatus).populate(
			toAddress(listAddress),
			toAddress(addr)
		).onSuccess(async (): Promise<void> => {
			onSuccess();
			performBatchedUpdates((): void => {
				set_tokens(['']);
				set_nonce((n): number => n + 1);
			});
		}).perform();
	}, [listAddress, onSuccess, provider]);

	const onBatchAddTokens = useCallback(async (addr: string[]): Promise<void> => {
		new Transaction(provider, addBatchTokensToList, set_txStatus).populate(
			toAddress(listAddress),
			addr
		).onSuccess(async (): Promise<void> => {
			onSuccess();
			performBatchedUpdates((): void => {
				set_tokens(['']);
				set_nonce((n): number => n + 1);
			});
		}).perform();
	}, [listAddress, onSuccess, provider]);

	const onSubmit = useCallback(async (): Promise<void> => {
		if (tokens.length === 1) {
			onAddToken(tokens[0]);
		} else {
			onBatchAddTokens(tokens);
		}
	}, [onAddToken, onBatchAddTokens, tokens]);

	return (
		<div className={'my-4'}>
			<div className={'box-100 p-4 md:p-6'}>
				<b>{'Add a token'}</b>
				<p className={'mt-2 text-sm text-neutral-500'}>
					{'You can add any ERC20 token to the list. The token must be on the same chain as the list. Make sure you have enough funds to pay for the gas and that the logo has been set in your registry'}
				</p>
				<div className={'mt-6'}>
					<div className={'grid w-full grid-cols-12 gap-4'}>
						<div className={'col-span-6'}>
							<label className={'text-xs'}>{'Token Address'}</label>
						</div>
						<div className={'col-span-3'}>
							<label className={'text-xs'}>{'Symbol'}</label>
						</div>
						<div className={'col-span-3'}>
							<label className={'text-xs'}>{'Decimals'}</label>
						</div>
					</div>
					<div className={'space-y-2'}>
						{tokens.map((eachToken, index): ReactElement => (
							<AddTokenInput
								key={`${nonce}_${index}`}
								token={eachToken}
								isAlreadyInList={tokensInList.some((eachTokenInList: TToken): boolean => toAddress(eachTokenInList.address) === toAddress(eachToken))}
								onChange={(newToken: string): void => {
									const	newTokens = [...tokens];
									newTokens[index] = newToken;
									set_tokens(newTokens);
								}}
								onRemove={(): void => {
									const	newTokens = [...tokens];
									newTokens.splice(index, 1);
									set_tokens(newTokens);
								}} />
						))}
					</div>
					<div className={'flex justify-end space-x-4 pt-4'}>
						<button
							onClick={(): void => set_tokens([...tokens, ''])}
							className={'cursor-pointer text-xs text-neutral-900 transition-colors hover:text-neutral-900 hover:underline'}>
							{'Add another token'}
						</button>
						<Button
							onClick={onSubmit}
							isBusy={!txStatus.none}
							isDisabled={tokens.length === 0 || tokens.some((eachToken: string): boolean => isZeroAddress(toAddress(eachToken)))}>
							{'Add Tokens to list'}
						</Button>
					</div>
				</div>
			</div>

		</div>
	);
}

export default ViewAddTokens;
