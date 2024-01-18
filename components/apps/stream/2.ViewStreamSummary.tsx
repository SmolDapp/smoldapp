import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {differenceInDays, differenceInMonths, differenceInSeconds, getUnixTime, isAfter, isBefore} from 'date-fns';
import {erc20ABI, useContractRead} from 'wagmi';
import {formatAmount, toAddress, toBigInt} from '@builtbymom/web3/utils';
import {IconChevronBoth} from '@icons/IconChevronBoth';
import {useIntervalEffect} from '@react-hookz/web';
import {useStream} from '@stream/useStream';
import {approveERC20, deployVestingContract, isApprovedERC20} from '@utils/actions';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';
import {Counter} from '@common/Counter';

import {getDefaultVestingContract} from './constants';
import {SuccessModal} from './successModal';

import type {ReactElement} from 'react';

function Buttons(): ReactElement {
	const {provider, address} = useWeb3();
	const {chainID} = useChainID();
	const {configuration, dispatchConfiguration} = useStream();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const [txStatusAllowance, set_txStatusAllowance] = useState(defaultTxStatus);
	const [isSuccessModalOpen, set_isSuccessModalOpen] = useState(false);

	const {data: allowance, refetch} = useContractRead({
		address: toAddress(configuration.tokenToSend?.address),
		abi: erc20ABI,
		chainId: chainID,
		functionName: 'allowance',
		args: [toAddress(address), toAddress(getDefaultVestingContract(chainID))]
	});

	const onApproveToken = useCallback(async (): Promise<void> => {
		const spenderAddress = getDefaultVestingContract(chainID);
		if (!spenderAddress) {
			console.warn(`No vesting contract on chain ${chainID}`);
			return;
		}
		const isApproved = await isApprovedERC20({
			connector: provider,
			contractAddress: toAddress(configuration.tokenToSend?.address),
			spenderAddress: toAddress(spenderAddress),
			amount: configuration.amountToSend?.raw || 0n
		});
		if (!isApproved) {
			const result = await approveERC20({
				connector: provider,
				chainID: chainID,
				contractAddress: toAddress(configuration.tokenToSend?.address),
				spenderAddress: toAddress(spenderAddress),
				amount: configuration.amountToSend?.raw || 0n,
				statusHandler: set_txStatusAllowance
			});
			if (result.isSuccessful) {
				await refetch();
			}
		}
	}, [chainID, configuration.amountToSend?.raw, configuration.tokenToSend?.address, provider, refetch]);

	const deployNewVestingContract = useCallback(async (): Promise<void> => {
		const vestingContractAddress = getDefaultVestingContract(chainID);
		if (!vestingContractAddress) {
			console.warn(`No vesting contract on chain ${chainID}`);
			return;
		}
		const result = await deployVestingContract({
			connector: provider,
			chainID: chainID,
			contractAddress: vestingContractAddress,
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
			owner: toAddress(address),
			statusHandler: set_txStatus
		});
		if (result.isSuccessful) {
			set_isSuccessModalOpen(true);
		}
	}, [
		address,
		chainID,
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
					onApproveToken();
				}}
				isDisabled={toBigInt(allowance) >= toBigInt(configuration?.amountToSend?.raw) || !address}
				isBusy={txStatusAllowance.pending}
				className={'w-full'}>
				{'Approve'}
			</Button>
			<Button
				onClick={deployNewVestingContract}
				isDisabled={
					allowance === 0n ||
					allowance === undefined ||
					allowance < toBigInt(configuration?.amountToSend?.raw) ||
					!address
				}
				isBusy={txStatus.pending}
				className={'w-full'}>
				{'Deploy'}
			</Button>
			<SuccessModal
				isOpen={isSuccessModalOpen}
				onClose={() => {
					dispatchConfiguration({type: 'RESET', payload: undefined});
					set_isSuccessModalOpen(false);
				}}
			/>
		</div>
	);
}

function ViewStreamSummary(): ReactElement {
	const {address} = useWeb3();
	const {configuration} = useStream();
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
						<b>{'Let’s practice safe streaming'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Before we set up your stream let’s take a moment to check all the details are correct.'}
						</p>
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
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per month'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perMonth,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per day'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perDay,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-sm font-medium text-neutral-900'}>{'Per seconds'}</dt>
										<dd className={'font-number text-sm text-neutral-900'}>
											{`${formatAmount(
												perSecond,
												configuration.tokenToSend?.decimals || 18,
												configuration.tokenToSend?.decimals || 18
											)} ${configuration.tokenToSend?.symbol || ''}`}
										</dd>
									</dl>

									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
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
								<div className={'bg-primary-100 rounded-md p-4 opacity-80'}>
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Token'}</dt>
										<dd className={'font-number truncate text-xs text-neutral-900'}>
											{configuration.tokenToSend?.address || ''}
										</dd>
									</dl>
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Recipient'}</dt>
										<dd className={'font-number truncate text-xs text-neutral-900'}>
											{configuration.receiver.address || ''}
										</dd>
									</dl>
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Funder'}</dt>
										<dd className={'font-number truncate text-xs text-neutral-900'}>{address}</dd>
									</dl>
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Amount'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.amountToSend.raw.toString() || ''}
										</dd>
									</dl>
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
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
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
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
									<dl className={'mb-2 flex flex-col justify-between md:mb-0 md:flex-row'}>
										<dt className={'text-xs font-medium text-neutral-900'}>{'Vesting Start'}</dt>
										<dd className={'font-number text-xs text-neutral-900'}>
											{configuration.vestingStartDate?.toISOString() || ''}
										</dd>
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

export default ViewStreamSummary;
