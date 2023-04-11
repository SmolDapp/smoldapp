import React, {useCallback, useState} from 'react';
import IconInfo from 'components/icons/IconInfo';
import {useMigratooor} from 'contexts/useMigratooor';
import {useWallet} from 'contexts/useWallet';
import {sendEther} from 'utils/actions/sendEth';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN, Zero} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ChangeEvent, ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function	TableDonateRow(): ReactElement {
	const {balances, refresh} = useWallet();
	const {provider, isActive} = useWeb3();
	const {amounts, set_amounts, shouldDonateETH, amountToDonate, set_shouldDonateETH, set_amountToDonate} = useMigratooor();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const chain = useChain();

	const	handleSuccessCallback = useCallback(async (): Promise<void> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
		});
	}, [balances]); // eslint-disable-line react-hooks/exhaustive-deps

	async function	onDonate(): Promise<void> {
		new Transaction(provider, sendEther, set_txStatus).populate(
			toAddress(process.env.RECEIVER_ADDRESS),
			amountToDonate.raw,
			balances[ETH_TOKEN_ADDRESS]?.raw
		).onSuccess(async (): Promise<void> => handleSuccessCallback()).perform();
	}

	const	onSelect = useCallback((): void => {
		performBatchedUpdates((): void => {
			if (shouldDonateETH) {
				set_amountToDonate(toNormalizedBN(Zero)); //reset
			} else {
				set_amountToDonate(toNormalizedBN((balances?.[ETH_TOKEN_ADDRESS]?.raw || Zero).div(1000).mul(1)));
			}
			set_shouldDonateETH((shouldDonateETH: boolean): boolean => !shouldDonateETH);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [balances, shouldDonateETH]);

	return (
		<div
			role={'button'}
			onClick={onSelect}
			className={`relative col-span-12 mb-0 border-x-2 bg-neutral-0 px-3 py-2 pb-4 text-neutral-900 transition-colors hover:bg-neutral-100 md:px-6 md:pb-2 ${shouldDonateETH ? 'border-transparent' : 'border-transparent'}`}>
			<div className={'grid grid-cols-12 md:grid-cols-9'}>
				<div className={'col-span-12 flex h-14 flex-row items-center space-x-4 border-0 border-neutral-200 md:col-span-3 md:border-r'}>
					<input
						type={'checkbox'}
						checked={shouldDonateETH}
						onChange={(): void => undefined} //handled by onClick on parent
						className={'checkbox cursor-pointer'} />
					<b suppressHydrationWarning>{`Donate ${chain.getCurrent()?.coin || 'ETH'}`}</b>
					<div className={'tooltip !ml-2'}>
						<IconInfo className={'h-[14px] w-[14px] text-neutral-900'} />
						<span className={'tooltiptext z-[100000] text-xs'}>
							<p suppressHydrationWarning>{`The Migratooor is completely free (except for the standard EVM transaction fees) and doesn't charge any fees. However, if you'd like to support us and help us create new features, you can donate some ${chain.getCurrent()?.coin || 'ETH'}!`}</p>
						</span>
					</div>
				</div>
				<div className={'col-span-12 flex flex-row items-center px-1 md:col-span-5 md:px-6'}>
					<div
						onClick={(e): void => e.stopPropagation()}
						className={`flex h-10 w-full items-center p-2 ${(balances?.[ETH_TOKEN_ADDRESS]?.raw || Zero)?.isZero() ? 'box-100' : 'box-0'}`}>
						<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
							<input
								className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm font-bold outline-none scrollbar-none'}
								type={'number'}
								min={0}
								max={balances?.[ETH_TOKEN_ADDRESS]?.normalized || 0}
								disabled={(balances?.[ETH_TOKEN_ADDRESS]?.raw || Zero)?.isZero()}
								inputMode={'numeric'}
								pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
								value={amountToDonate?.normalized ?? '0'}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									if ((balances?.[ETH_TOKEN_ADDRESS]?.raw || Zero)?.isZero()) {
										return;
									}
									let	newAmount = handleInputChangeEventValue(e, balances[ETH_TOKEN_ADDRESS]?.decimals || 18);
									if (newAmount.raw.gt(balances[ETH_TOKEN_ADDRESS]?.raw || Zero)) {
										newAmount = balances[ETH_TOKEN_ADDRESS];
									}
									performBatchedUpdates((): void => {
										set_amountToDonate(newAmount);
										set_shouldDonateETH(newAmount.raw.gt(Zero));
									});
								}} />
						</div>
					</div>
				</div>
				<div
					onClick={(e): void => e.stopPropagation()}
					className={'col-span-1 hidden w-full flex-row items-center md:flex'}>
					<Button
						className={'yearn--button-smaller !w-full'}
						isBusy={txStatus.pending}
						isDisabled={!isActive || ((amounts[ETH_TOKEN_ADDRESS]?.raw || Zero).isZero())}
						onClick={(): void => {
							onDonate();
						}}>
						{'Donate'}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default TableDonateRow;
