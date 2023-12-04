import React, {Fragment, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useVesting} from 'components/apps/vesting/useVesting';
import {differenceInDays, differenceInMonths, differenceInSeconds, isAfter, isBefore} from 'date-fns';
import {animate} from 'framer-motion';
import {useIntervalEffect} from '@react-hookz/web';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

export function Counter({value}: {value: number}): ReactElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nodeRef = useRef<any>();

	useLayoutEffect((): (() => void) => {
		const node = nodeRef.current;
		if (node) {
			const controls = animate(Number(node.textContent || 0), value, {
				duration: 1,
				onUpdate(value) {
					node.textContent = formatAmount(value.toFixed(9), 2, 2);
				}
			});
			return () => controls.stop();
		}
		return () => undefined;
	}, [value]);

	return (
		<span
			suppressHydrationWarning
			ref={nodeRef}
		/>
	);
}

function ViewVestingSummary(): ReactElement {
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
		console.log(
			Number(configuration.amountToSend?.normalized || 0) /
				(differenceInSeconds(new Date(), configuration.vestingStartDate || new Date()) || 1)
		);
		set_alreadyVested(alreadyVested + 1);
	}, 1000);

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
						<div className={'col-span-12 rounded-md p-4'}>
							<p className={'text-sm text-neutral-900'}>
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
									<dd className={'font-number text-sm text-neutral-900'}>{renderAlreadyVested()}</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewVestingSummary;
