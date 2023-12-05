import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {addSeconds, differenceInSeconds, format} from 'date-fns';
import {erc20ABI, useContractReads} from 'wagmi';
import {useIntervalEffect} from '@react-hookz/web';
import {YVESTING_SIMPLE_ABI} from '@utils/abi/yVestingSimple.abi';
import {claimFromVesting} from '@utils/actions';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TStreamArgs} from './useUserStreams';

function AlreadyStreamed(props: {vesting: TStreamArgs; available: bigint; decimals: number}): ReactElement {
	const [nonce, set_nonce] = useState(0);
	const alreadyVested = useMemo((): number => {
		nonce;
		const start = new Date(Number(props.vesting.vesting_start) * 1000);
		const end = addSeconds(start, Number(props.vesting.vesting_duration));
		const now = new Date();
		console.log(start, end, now);
		if (now < start) {
			return 0;
		}
		if (now > end) {
			return Number(toNormalizedBN(props.available, props.decimals).normalized);
		}
		const seconds = differenceInSeconds(now, start);
		const totalSeconds = differenceInSeconds(end, start);
		const percentage = seconds / totalSeconds;
		const vested = Number(toNormalizedBN(props.available, props.decimals).normalized) * percentage;
		return Number(vested);
	}, [nonce, props.vesting.vesting_start, props.vesting.vesting_duration, props.available, props.decimals]);

	useIntervalEffect(() => {
		set_nonce(nonce + 1);
	}, 1000);

	return (
		<b
			suppressHydrationWarning
			className={'font-number text-sm text-neutral-900'}>
			<Counter
				value={alreadyVested}
				decimals={props.decimals}
			/>
		</b>
	);
}
export function VestingElement({vesting}: {vesting: TStreamArgs}): ReactElement {
	const {provider} = useWeb3();
	const {chainID} = useChainID();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const {data, refetch} = useContractReads({
		contracts: [
			{
				address: toAddress(vesting.token),
				abi: erc20ABI,
				chainId: vesting.chainID,
				functionName: 'symbol'
			},
			{
				address: toAddress(vesting.token),
				abi: erc20ABI,
				chainId: vesting.chainID,
				functionName: 'decimals'
			},
			{
				address: toAddress(vesting.escrow),
				abi: YVESTING_SIMPLE_ABI,
				chainId: vesting.chainID,
				functionName: 'total_claimed'
			}
		],
		select(data) {
			return [data?.[0]?.result || '', Number(toBigInt(data?.[1]?.result || 18)), toBigInt(data?.[2]?.result)];
		}
	});
	const [symbol, decimals, totalClaimed] = (data || ['', 18, 0n]) as [string, number, bigint];

	const onClaim = useCallback(async (): Promise<void> => {
		const result = await claimFromVesting({
			connector: provider,
			chainID: chainID,
			contractAddress: vesting.escrow,
			statusHandler: set_txStatus
		});
		if (result.isSuccessful) {
			await refetch();
		}
	}, [chainID, provider, refetch, vesting.escrow]);

	return (
		<div className={'flex flex-col px-6 py-4'}>
			<div className={'flex w-full flex-row items-center justify-between'}>
				<div className={'flex gap-4'}>
					<div>
						<ImageWithFallback
							src={`${process.env.SMOL_ASSETS_URL}/token/1/${vesting.token}/logo-128.png`}
							width={42}
							height={42}
							alt={''}
						/>
					</div>
					<div>
						<b>{symbol}</b>
						<small className={'font-number text-neutral-900/60'}>{toAddress(vesting.token)}</small>
					</div>
				</div>
				<div className={''}>
					<AlreadyStreamed
						available={vesting.amount - totalClaimed}
						vesting={vesting}
						decimals={decimals}
					/>
					<small className={'font-number text-neutral-900/60'}>
						{`Over ${formatAmount(toNormalizedBN(vesting.amount, decimals).normalized, 4, 4)} ${symbol}`}
					</small>
				</div>
				<div>
					<Button
						onClick={onClaim}
						variant={'outlined'}
						isBusy={txStatus.pending}
						className={'mt-2 !h-8 w-full'}>
						{'Claim'}
					</Button>
				</div>
			</div>
			<div className={'mt-4 grid gap-1 rounded-md bg-neutral-100 p-4'}>
				<dl className={'flex justify-between'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'Already claimed: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{`${formatAmount(toNormalizedBN(totalClaimed, decimals).normalized)} ${symbol}`}
					</dd>
				</dl>
				<dl className={'flex justify-between'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'Start Date: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{format(new Date(Number(vesting.vesting_start) * 1000), 'PPPPpp')}
					</dd>
				</dl>
				<dl className={'flex justify-between'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'End Date: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{format(
							new Date(Number(vesting.vesting_start) * 1000 + Number(vesting.vesting_duration) * 1000),
							'PPPPpp'
						)}
					</dd>
				</dl>
				{vesting.cliff_length === 0n ? (
					<Fragment />
				) : (
					<dl className={'flex justify-between'}>
						<dt className={'text-xs font-medium text-neutral-900'}>{'End of Cliff'}</dt>
						<dd className={'font-number text-xs text-neutral-900'}>
							{format(
								new Date(Number(vesting.vesting_start) * 1000 + Number(vesting.cliff_length) * 1000),
								'PPPPpp'
							)}
						</dd>
					</dl>
				)}
			</div>
		</div>
	);
}
