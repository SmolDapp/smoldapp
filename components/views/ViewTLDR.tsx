import React, {useCallback, useState} from 'react';
import {useSelected} from 'contexts/useSelected';
import {useWallet} from 'contexts/useWallet';
import {ethers} from 'ethers';
import {sendEther} from 'utils/actions/sendEth';
import {transfer} from 'utils/actions/transferToken';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {TMinBalanceData} from 'hooks/useBalances';
import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

function	ViewTLDR(): ReactElement {
	const	{selected, set_selected, amounts, set_amounts, destinationAddress, shouldDonateETH, amountToDonate, set_amountToDonate, set_shouldDonateETH} = useSelected();
	const	{balances, refresh} = useWallet();
	const 	{provider, isActive} = useWeb3();
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);
	const	chain = useChain();

	const	handleSuccessCallback = useCallback(async (tokenAddress: TAddress): Promise<TDict<TMinBalanceData>> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		if (!isZeroAddress(tokenAddress)) {
			tokensToRefresh.push({token: tokenAddress, decimals: balances[tokenAddress].decimals, symbol: balances[tokenAddress].symbol});
		}

		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			if (!isZeroAddress(tokenAddress)) {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
			} else {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
					...amounts,
					[ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS],
					[tokenAddress]: updatedBalances[tokenAddress]
				}));
			}
			set_selected((s: TAddress[]): TAddress[] => s.filter((item: TAddress): boolean => toAddress(item) !== tokenAddress));
		});
		return updatedBalances;
	}, [balances]); // eslint-disable-line react-hooks/exhaustive-deps

	async function	onMigrateSelected(): Promise<void> {
		let	shouldMigrateETH = false;
		const	allSelected = [...selected];
		for (const token of allSelected) {
			if ((amounts[toAddress(token)]?.raw || ethers.constants.Zero).isZero()) {
				continue;
			}
			if (toAddress(token) === ETH_TOKEN_ADDRESS) { //Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			try {
				new Transaction(provider, transfer, set_txStatus).populate(
					toAddress(token),
					toAddress(destinationAddress),
					amounts[toAddress(token)]?.raw
				).onSuccess(async (): Promise<void> => {
					handleSuccessCallback(toAddress(token));
				}).perform();
			} catch (error) {
				console.error(error);
			}
		}

		const	willDonateEth = (shouldDonateETH && (amountToDonate?.raw || ethers.constants.Zero).gt(ethers.constants.Zero));
		const	willMigrateEth = (shouldMigrateETH && (amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).gt(ethers.constants.Zero));
		const	hasEnoughEth = balances[ETH_TOKEN_ADDRESS]?.raw?.gt((amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).sub(amountToDonate.raw)) && (amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).sub(amountToDonate.raw).gt(0);

		if (willDonateEth && willMigrateEth && hasEnoughEth) {
			const	isOK = await new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(process.env.RECEIVER_ADDRESS),
				amountToDonate.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).perform();
			if (isOK) {
				performBatchedUpdates((): void => {
					set_amountToDonate(toNormalizedBN(0));
					set_shouldDonateETH(false);
				});

				const newBalance = await handleSuccessCallback(toAddress(ethers.constants.AddressZero));
				const ethNewBalance = newBalance[ETH_TOKEN_ADDRESS].raw;
				let expectedToMigrate = amounts[ETH_TOKEN_ADDRESS].raw;

				if (ethNewBalance.lt(expectedToMigrate)) {
					expectedToMigrate = ethNewBalance;
				}
				await new Transaction(provider, sendEther, set_txStatus).populate(
					toAddress(destinationAddress),
					expectedToMigrate,
					newBalance[ETH_TOKEN_ADDRESS].raw
				).onSuccess(async (): Promise<void> => {
					handleSuccessCallback(toAddress(ETH_TOKEN_ADDRESS));
				}).perform();
			}

		} else if (willDonateEth) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(process.env.RECEIVER_ADDRESS),
				amountToDonate.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => {
				performBatchedUpdates((): void => {
					set_amountToDonate(toNormalizedBN(0));
					set_shouldDonateETH(false);
				});
				handleSuccessCallback(toAddress(ethers.constants.AddressZero));
			}).perform();
		} else if (willMigrateEth) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(destinationAddress),
				amounts[ETH_TOKEN_ADDRESS]?.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => {
				handleSuccessCallback(toAddress(ethers.constants.AddressZero));
			}).perform();
		}
	}

	return (
		<section id={'review'} className={'pt-10'}>
			<div className={'box-100 relative grid w-full overflow-hidden !rounded-b-none p-4 md:p-6'}>
				<div className={'w-full md:w-3/4'}>
					<a href={'#review'}>
						<b>{'TLDR;'}</b>
					</a>
					<p className={'text-sm text-neutral-500'}>
						{'Here is a quick summary of the upcoming transactions.'}
					</p>
				</div>
				<div className={'mt-6 flex flex-col space-y-2 font-mono text-sm'}>

					<div className={'mb-2 grid w-full grid-cols-11 border-b border-neutral-300 pb-2 text-sm tabular-nums text-neutral-500'}>
						<p className={'col-span-4 flex items-center justify-between'}>
							<span className={'font-number'}>{'Token'}</span>
							&nbsp;
							<span className={'font-number'}>{'Amount'}</span>
						</p>
						<p className={'text-center'}>
							{''}
						</p>
						<p className={'col-span-6 text-end'}>
							<span className={'font-number text-sm'}>
								{'Recipient Address'}
							</span>
						</p>
					</div>

					{selected.filter((token): boolean => toAddress(token) !== ETH_TOKEN_ADDRESS).map((token, index): JSX.Element => {
						return (
							<div key={index} className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
								<p className={'col-span-4 flex items-center justify-between'}>
									<span className={'font-number'}>{balances[toAddress(token)]?.symbol || 'Tokens'}</span>
									&nbsp;
									<span className={'font-number'}>{amounts[toAddress(token)]?.normalized || 0}</span>
								</p>
								<p className={'text-center'}>
									{'→'}
								</p>
								<p className={'col-span-6 text-end'}>
									<span className={'font-number text-sm'}>
										{toAddress(destinationAddress).replace(/(.{4})/g, '$1 ')}
									</span>
								</p>
							</div>
						);
					})}
					{selected.includes(ETH_TOKEN_ADDRESS) && amounts[ETH_TOKEN_ADDRESS]?.raw.gt(0) ? (
						<div className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
							<p className={'col-span-4 flex items-center justify-between'}>
								<span className={'font-number'}>{chain.getCurrent()?.coin || 'ETH'}</span>
							&nbsp;
								<span className={'font-number'}>{`~ ${Number(amounts[ETH_TOKEN_ADDRESS]?.normalized || 0) - Number(amountToDonate?.normalized || 0)}`}</span>
							</p>
							<p className={'text-center'}>
								{'→'}
							</p>
							<p className={'col-span-6 text-end'}>
								<span className={'font-number text-sm'}>
									{toAddress(destinationAddress).replace(/(.{4})/g, '$1 ')}
								</span>
							</p>
						</div>
					) : null}
					{amountToDonate.raw.gt(0) ? (
						<div className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
							<p className={'col-span-4 flex items-center justify-between'}>
								<span className={'font-number'}>{`Donate ${chain.getCurrent()?.coin || 'ETH'}`}</span>
								&nbsp;
								<span className={'font-number'}>{amountToDonate?.normalized || 0}</span>
							</p>
							<p className={'text-center'}>
								{'→'}
							</p>
							<p className={'col-span-6 text-end'}>
								<span className={'font-number text-sm'}>
									{toAddress(process.env.RECEIVER_ADDRESS).replace(/(.{4})/g, '$1 ')}
								</span>
							</p>
						</div>
					) : null}

				</div>
			</div>
			<div className={'fixed inset-x-0 bottom-0 z-20 col-span-12 flex w-full max-w-4xl flex-row items-center justify-between rounded-b-md bg-neutral-900 p-4 text-neutral-0 md:relative md:px-6 md:py-4'}>
				<div className={'flex flex-col'} />
				<div>
					<Button
						className={'yearn--button-smaller !w-[160px] !text-sm'}
						variant={'reverted'}
						isBusy={txStatus.pending}
						isDisabled={!isActive || ((selected.length === 0) && (amountToDonate.raw.isZero() && amountToDonate.raw.isZero()))}
						onClick={async (): Promise<void> => onMigrateSelected()}>
						{'Migrate selected'}
					</Button>
				</div>
			</div>
		</section>
	);
}
export default ViewTLDR;
