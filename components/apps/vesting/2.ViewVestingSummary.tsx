import React, {Fragment, useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useVesting} from 'components/apps/vesting/useVesting';
import {differenceInDays, differenceInMonths, differenceInSeconds, getUnixTime, isAfter, isBefore} from 'date-fns';
import {erc20ABI, useContractRead} from 'wagmi';
import {animate} from 'framer-motion';
import {IconChevronBoth} from '@icons/IconChevronBoth';
import {useIntervalEffect} from '@react-hookz/web';
import {approveERC20, deployVestingContract} from '@utils/actions';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {FACTORY_VESTING_CONTRACT} from './constants';

import type {ReactElement} from 'react';

export function Counter({value, decimals = 18}: {value: number; decimals: number}): ReactElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nodeRef = useRef<any>();

	useLayoutEffect((): (() => void) => {
		const node = nodeRef.current;
		if (node) {
			const controls = animate(Number(node.textContent || 0), value, {
				duration: 1,
				onUpdate(value) {
					node.textContent = value.toFixed(decimals);
				}
			});
			return () => controls.stop();
		}
		return () => undefined;
	}, [value, decimals]);

	return (
		<span
			className={'font-number'}
			suppressHydrationWarning
			ref={nodeRef}
		/>
	);
}

function Buttons(): ReactElement {
	const {provider, address} = useWeb3();
	const {configuration} = useVesting();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const [txStatusAllowance, set_txStatusAllowance] = useState(defaultTxStatus);

	const {data: allowance} = useContractRead({
		address: toAddress(configuration.tokenToSend?.address),
		abi: erc20ABI,
		chainId: 1337,
		functionName: 'allowance',
		args: [toAddress(address), FACTORY_VESTING_CONTRACT]
	});

	const onApproveToken = useCallback(async (): Promise<void> => {
		// const isApproved = await isApprovedERC20({
		// 	connector: provider,
		// 	contractAddress: toAddress(configuration.tokenToSend?.address),
		// 	spenderAddress: toAddress(FACTORY_VESTING_CONTRACT),
		// 	amount: configuration.amountToSend?.raw || 0n
		// });
		// if (!isApproved) {
		console.log(configuration.tokenToSend?.address, configuration.amountToSend?.raw);
		const result = await approveERC20({
			connector: provider,
			chainID: 1337,
			contractAddress: toAddress(configuration.tokenToSend?.address),
			spenderAddress: toAddress(FACTORY_VESTING_CONTRACT),
			amount: configuration.amountToSend?.raw || 0n,
			statusHandler: set_txStatusAllowance
		});
		if (result.isSuccessful) {
			console.log('yes');
		}
		// }
	}, [configuration.amountToSend?.raw, configuration.tokenToSend?.address, provider]);

	const deployNewVestingContract = useCallback(async (): Promise<void> => {
		const result = await deployVestingContract({
			connector: provider,
			chainID: 1337,
			contractAddress: FACTORY_VESTING_CONTRACT,

			token: toAddress(configuration.tokenToSend?.address),
			recipient: toAddress(configuration.receiver.address),
			amount: configuration.amountToSend?.raw || 0n,
			vesting_duration: toBigInt(
				differenceInSeconds(
					configuration.vestingEndDate || new Date(),
					configuration.vestingStartDate || new Date()
				)
			),
			vesting_start: toBigInt(getUnixTime(configuration.vestingStartDate || 0)),
			cliff_length: toBigInt(
				differenceInSeconds(
					configuration.cliffEndDate || configuration.vestingStartDate || new Date(),
					configuration.vestingStartDate || new Date()
				)
			),
			open_claim: true,
			support_vyper: 0n,
			owner: toAddress(address),
			statusHandler: set_txStatus
		});
		if (result.isSuccessful) {
			//
		}
	}, [
		address,
		configuration.amountToSend?.raw,
		configuration.cliffEndDate,
		configuration.receiver.address,
		configuration.tokenToSend?.address,
		configuration.vestingEndDate,
		configuration.vestingStartDate,
		provider
	]);

	return (
		<div className={'mt-4 grid grid-cols-2 gap-4'}>
			<Button
				onClick={(): void => {
					console.log('approve');
					onApproveToken();
				}}
				isDisabled={toBigInt(allowance) >= toBigInt(configuration?.amountToSend?.raw)}
				isBusy={txStatusAllowance.pending}
				className={'w-full'}>
				{'Approve'}
			</Button>
			<Button
				onClick={deployNewVestingContract}
				isDisabled={
					allowance === 0n ||
					allowance === undefined ||
					allowance < toBigInt(configuration?.amountToSend?.raw)
				}
				isBusy={txStatus.pending}
				className={'w-full'}>
				{'Deploy'}
			</Button>
		</div>
	);
}

function ViewVestingSummary(): ReactElement {
	const {address} = useWeb3();
	const {configuration} = useVesting();
	const [alreadyVested, set_alreadyVested] = useState<number>(0);

	const perSecond = useMemo((): number => {
		return (
			Number(configuration.amountToSend?.normalized || 0) /
			(differenceInSeconds(
				configuration.vestingEndDate || new Date(),
				configuration.vestingStartDate || new Date()
			) || 1)
		);
	}, [configuration]);

	const perDay = useMemo((): number => {
		return (
			Number(configuration.amountToSend?.normalized || 0) /
			(differenceInDays(
				configuration.vestingEndDate || new Date(),
				configuration.vestingStartDate || new Date()
			) || 1)
		);
	}, [configuration]);

	const perMonth = useMemo((): number => {
		return (
			Number(configuration.amountToSend?.normalized || 0) /
			(differenceInMonths(
				configuration.vestingEndDate || new Date(),
				configuration.vestingStartDate || new Date()
			) || 1)
		);
	}, [configuration]);

	useIntervalEffect(() => {
		set_alreadyVested(alreadyVested + 1);
	}, 100);

	function renderAlreadyVested(): ReactElement {
		if (!configuration.tokenToSend || !configuration.amountToSend) {
			return <Fragment />;
		}

		if (isBefore(new Date(), configuration.vestingStartDate || new Date())) {
			return (
				<Fragment>
					{`${formatAmount(0, configuration.tokenToSend?.decimals, configuration.tokenToSend?.decimals)} ${
						configuration.tokenToSend?.symbol || ''
					}`}
				</Fragment>
			);
		}
		if (isAfter(new Date(), configuration.vestingEndDate || new Date())) {
			return (
				<Fragment>
					{`${formatAmount(
						Number(configuration.amountToSend?.normalized),
						configuration.tokenToSend?.decimals,
						configuration.tokenToSend?.decimals
					)} ${configuration.tokenToSend?.symbol || ''}`}
				</Fragment>
			);
		}
		return (
			<Fragment>
				<Counter
					decimals={configuration.tokenToSend?.decimals || 18}
					value={Number(
						perSecond * differenceInSeconds(new Date(), configuration.vestingStartDate || new Date())
					)}
				/>
				{` ${configuration.tokenToSend?.symbol || ''}`}
			</Fragment>
		);
	}

	if (!configuration.tokenToSend || !configuration.amountToSend) {
		return <Fragment />;
	}

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Pls configure your vesting contract?'}</b>
						<p className={'text-sm text-neutral-500'}>{'Yeah, boring, but go you'}</p>
					</div>
					<div className={'box-0 mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4'}>
						<details className={'col-span-12 rounded-md'}>
							<summary className={'relative block p-4'}>
								<p className={'pr-5 text-sm text-neutral-900'}>
									<b>
										<AddressLike address={toAddress(configuration.receiver.address)} />
									</b>
									{' will be granted '}
									<b>
										{`${formatAmount(configuration.amountToSend?.normalized || 0, 4, 4)}\
									${configuration.tokenToSend?.symbol || ''}`}
									</b>
									{', with vesting spread over a period of '}
									<b>
										{`${differenceInDays(
											configuration.vestingEndDate || new Date(),
											configuration.vestingStartDate || new Date()
										)} days`}
									</b>
									{'.'}
								</p>

								<div className={'mt-4'}>
									<dl className={'flex justify-between'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per month'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perMonth,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'flex justify-between'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per day'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perDay,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'flex justify-between'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per seconds'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perSecond,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'flex justify-between'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Already vested'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{renderAlreadyVested()}
										</dd>
									</dl>
								</div>

								<div className={'absolute right-4 top-4'}>
									<IconChevronBoth
										className={
											'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'
										}
									/>
								</div>
							</summary>
							<div className={'p-4 pt-0'}>
								<small className={'ml-1 pb-1 text-left'}>{'Params'}</small>
								<div className={'rounded-md bg-primary-100 p-4 opacity-80'}>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Token'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.tokenToSend?.address || ''}
										</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Recipient'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.receiver.address || ''}
										</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Owner'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>{address}</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Amount'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.amountToSend.raw.toString() || ''}
										</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>
											{'Vesting Duration (seconds)'}
										</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{differenceInSeconds(
												configuration.vestingEndDate || new Date(),
												configuration.vestingStartDate || new Date()
											)}
										</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>
											{'Cliff length (seconds)'}
										</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{differenceInSeconds(
												configuration.cliffEndDate ||
													configuration.vestingStartDate ||
													new Date(),
												configuration.vestingStartDate || new Date()
											)}
										</dd>
									</dl>
									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Vesting Start'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.vestingStartDate?.toISOString() || ''}
										</dd>
									</dl>

									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Open Claim'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>{'Yes'}</dd>
									</dl>

									<dl className={'flex justify-between'}>
										<dt className={'text-xs font-medium text-neutral-900'}>
											{'Support Vyper Fundation'}
										</dt>
										<dd className={'font-number text-xs text-neutral-900'}>{'1%'}</dd>
									</dl>
								</div>
							</div>
						</details>
					</div>
					<Buttons />
				</div>
			</div>
		</section>
	);
}

export default ViewVestingSummary;
