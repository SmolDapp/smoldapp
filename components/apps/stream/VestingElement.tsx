import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {addSeconds, differenceInSeconds, format} from 'date-fns';
import {erc20Abi} from 'viem';
import {useReadContracts} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {formatAmount, toAddress, toBigInt, toNormalizedBN} from '@builtbymom/web3/utils';
import {defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {useIntervalEffect} from '@react-hookz/web';
import {YVESTING_SIMPLE_ABI} from '@utils/abi/yVestingSimple.abi';
import {claimFromVesting} from '@utils/actions';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TStreamArgs} from './useUserStreams';

function AlreadyStreamed(props: {vesting: TStreamArgs; totalClaimed: bigint; decimals: number}): ReactElement {
	const [nonce, set_nonce] = useState(0);
	const alreadyVested = useMemo((): number => {
		nonce;
		const start = new Date(Number(props.vesting.vesting_start) * 1000);
		const end = addSeconds(start, Number(props.vesting.vesting_duration));
		const now = new Date();
		if (now < start) {
			return 0;
		}
		if (now > end) {
			return (
				Number(toNormalizedBN(props.vesting.amount, props.decimals).normalized) -
				Number(toNormalizedBN(props.totalClaimed, props.decimals).normalized)
			);
		}

		const seconds = differenceInSeconds(now, start);
		const totalSeconds = differenceInSeconds(end, start);
		const totalAmount = toNormalizedBN(props.vesting.amount, props.decimals).normalized;
		const rate = Number(totalAmount) / Number(totalSeconds);
		const vested = rate * Number(seconds) - Number(toNormalizedBN(props.totalClaimed, props.decimals).normalized);

		return Number(vested);
	}, [
		nonce,
		props.vesting.vesting_start,
		props.vesting.vesting_duration,
		props.vesting.amount,
		props.decimals,
		props.totalClaimed
	]);

	useIntervalEffect(() => {
		set_nonce(nonce + 1);
	}, 1000);

	return (
		<b
			suppressHydrationWarning
			className={'font-number text-center text-sm text-neutral-900  md:text-left'}>
			<Counter
				value={alreadyVested}
				decimals={props.decimals}
			/>
		</b>
	);
}
export function VestingElement({vesting}: {vesting: TStreamArgs}): ReactElement {
	const {address, provider} = useWeb3();
	const {chainID} = useChainID();
	const {getToken} = useTokenList();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const {data, refetch, isFetchedAfterMount} = useReadContracts({
		contracts: [
			{
				address: toAddress(vesting.token),
				abi: erc20Abi,
				chainId: vesting.chainID,
				functionName: 'symbol'
			},
			{
				address: toAddress(vesting.token),
				abi: erc20Abi,
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
		query: {
			select(data) {
				return [
					data?.[0]?.result || '',
					Number(toBigInt(data?.[1]?.result || 18)),
					toBigInt(data?.[2]?.result)
				];
			}
		}
	});
	const [symbol, decimals, totalClaimed] = (data || ['', 18, 0n]) as [string, number, bigint];
	const isButtonDisabled = !address || (!vesting.open_claim && address !== vesting.recipient);

	const onClaim = useCallback(async (): Promise<void> => {
		const result = await claimFromVesting({
			connector: provider,
			chainID: chainID,
			contractAddress: vesting.escrow,
			streamOwner: vesting.recipient,
			statusHandler: set_txStatus
		});
		if (result.isSuccessful) {
			await refetch();
		}
	}, [chainID, provider, refetch, vesting.escrow, vesting.recipient]);

	if (!isFetchedAfterMount || totalClaimed === vesting.amount) {
		return <Fragment />;
	}

	return (
		<div className={'flex flex-col px-6 py-4'}>
			<div className={'flex w-full flex-col items-start justify-between md:flex-row md:items-center'}>
				<div className={'flex gap-4'}>
					<div>
						<ImageWithFallback
							src={`${process.env.SMOL_ASSETS_URL}/token/${vesting.chainID}/${vesting.token}/logo-128.png`}
							altSrc={getToken({address: vesting.token, chainID})?.logoURI || ''}
							unoptimized
							width={42}
							height={42}
							alt={''}
						/>
					</div>
					<div>
						<b>{symbol}</b>
						<small className={'font-number w-2/3 truncate text-neutral-900/60 md:w-full'}>
							{toAddress(vesting.token)}
						</small>
					</div>
				</div>
				<div className={'mt-6 w-full text-center md:mt-0 md:w-auto md:text-left'}>
					<AlreadyStreamed
						totalClaimed={totalClaimed}
						vesting={vesting}
						decimals={decimals}
					/>
					<small className={'font-number text-neutral-900/60'}>
						{`of ${formatAmount(
							toNormalizedBN(vesting.amount - totalClaimed, decimals).normalized,
							4,
							4
						)} ${symbol}`}
					</small>
				</div>
				<div className={'w-full md:w-auto'}>
					<Button
						onClick={onClaim}
						isDisabled={isButtonDisabled}
						isBusy={txStatus.pending}
						className={'mt-2 !h-8 w-full'}>
						{'Claim'}
					</Button>
				</div>
			</div>
			<div className={'bg-neutral-100 mt-4 grid gap-1 rounded-md p-4'}>
				<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'Already claimed: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{`${formatAmount(toNormalizedBN(totalClaimed, decimals).normalized)} ${symbol}`}
					</dd>
				</dl>
				<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'Start Date: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{format(new Date(Number(vesting.vesting_start) * 1000), 'PPPp')}
					</dd>
				</dl>
				<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
					<dt className={'text-xs font-medium text-neutral-900'}>{'End Date: '}</dt>
					<dd className={'font-number text-xs text-neutral-900'}>
						{format(
							new Date(Number(vesting.vesting_start) * 1000 + Number(vesting.vesting_duration) * 1000),
							'PPPp'
						)}
					</dd>
				</dl>
				{vesting.cliff_length === 0n ? (
					<Fragment />
				) : (
					<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
						<dt className={'text-xs font-medium text-neutral-900'}>{'End of Cliff'}</dt>
						<dd className={'font-number text-xs text-neutral-900'}>
							{format(
								new Date(Number(vesting.vesting_start) * 1000 + Number(vesting.cliff_length) * 1000),
								'PPPp'
							)}
						</dd>
					</dl>
				)}
			</div>
		</div>
	);
}
