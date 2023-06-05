import React, {memo, useMemo, useState} from 'react';
import TableERC20Row from 'components/app/migratooor/TableERC20Row';
import ListHead from 'components/common/ListHead';
import {useMigratooor} from 'contexts/useMigratooor';
import {useWallet} from 'contexts/useWallet';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';

const ViewTable = memo(function ViewTable({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {isActive, chainID} = useWeb3();
	const {selected} = useMigratooor();
	const {balances, balancesNonce} = useWallet();
	const [sortBy, set_sortBy] = useState<string>('apy');
	const [sortDirection, set_sortDirection] = useState<'asc' | 'desc'>('desc');

	const balancesToDisplay = useMemo((): ReactElement[] => {
		balancesNonce;
		return (
			Object.entries(balances || [])
				.filter(([, balance]: [string, TBalanceData]): boolean => (
					toBigInt(balance.raw) > 0n || (balance?.force || false)
				))
				.sort((a: [string, TBalanceData], b: [string, TBalanceData]): number => {
					const [aAddress, aBalance] = a;
					const [bAddress, bBalance] = b;

					if (aAddress === ETH_TOKEN_ADDRESS) {
						return -1;
					}
					if (bAddress === ETH_TOKEN_ADDRESS) {
						return 1;
					}

					if (sortBy === 'name') {
						return sortDirection === 'asc'
							? aBalance.symbol.localeCompare(bBalance.symbol)
							: bBalance.symbol.localeCompare(aBalance.symbol);
					}
					if (sortBy === 'balance') {
						return sortDirection === 'asc'
							? toBigInt(aBalance.raw) > toBigInt(bBalance.raw) ? 1 : -1
							: toBigInt(aBalance.raw) > toBigInt(bBalance.raw) ? -1 : 1;
					}
					return 0;
				})
				.map(([address, balance]: [string, TBalanceData]): ReactElement => {
					return <TableERC20Row
						key={`${address}-${chainID}-${balance.symbol}`}
						balance={balance}
						address={toAddress(address)} />;
				})
		);
	}, [balances, balancesNonce, sortBy, sortDirection, chainID]);

	return (
		<section>
			<div className={'box-0 relative w-full'}>
				<div className={'flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Select the tokens to migrate'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Select the tokens you want to migrate to another wallet. You can migrate all your tokens at once or select individual tokens.'}
						</p>
					</div>
				</div>

				<div className={'border-t border-neutral-200'}>
					<ListHead
						sortBy={sortBy}
						sortDirection={sortDirection}
						onSort={(newSortBy, newSortDirection): void => {
							performBatchedUpdates((): void => {
								set_sortBy(newSortBy);
								set_sortDirection(newSortDirection as 'asc' | 'desc');
							});
						}}
						items={[
							{label: 'Token', value: 'name', sortable: true},
							{label: 'Amount', value: 'balance', sortable: false, className: 'col-span-10 md:pl-5', datatype: 'text'},
							{label: '', value: '', sortable: false, className: 'col-span-2'}
						]} />
					<div className={'flex w-full flex-col gap-2'}>
						{balancesToDisplay}
					</div>
				</div>

				<div className={'rounded-b-default sticky inset-x-0 bottom-0 z-20 flex w-full max-w-4xl flex-row items-center justify-between border-t border-neutral-200 bg-black p-4 text-neutral-0 md:relative md:px-6 md:py-4'}>
					<div />
					<div>
						<Button
							variant={'reverted-alt'}
							isDisabled={!isActive || Object.keys(selected).length === 0}
							onClick={onProceed}>
							{'Migrate selected'}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
});

export default ViewTable;
