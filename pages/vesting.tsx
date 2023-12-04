import React, {useMemo, useState} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/apps/0.ViewWallet';
import {Step, useVesting, VestingContextApp} from 'components/apps/vesting/useVesting';
import {differenceInSeconds} from 'date-fns';
import {erc20ABI, useContractReads} from 'wagmi';
import {useIntervalEffect} from '@react-hookz/web';
import ViewVestingConfiguration from '@vesting/1.ViewVestingConfiguration';
import ViewVestingSummary, {Counter} from '@vesting/2.ViewVestingSummary';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';

const OneVesting = {
	amount: 100000000000000000n,
	cliff_length: 0n,
	escrow: '0xCD9bDE4E3AeF598B2d50D2064F5A28028759bB41',
	funder: '0x9E63B020ae098E73cF201EE1357EDc72DFEaA518',
	open_claim: true,
	recipient: '0x334CE923420ff1aA4f272e92BF68013D092aE7B4',
	token: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
	vesting_duration: 2678400n,
	vesting_start: 1701454198n
};

function OneVestionRendering(): ReactElement {
	const [nonce, set_nonce] = useState(0);
	const {data: token} = useContractReads({
		contracts: [
			{
				address: toAddress(OneVesting.token),
				abi: erc20ABI,
				chainId: 1,
				functionName: 'symbol'
			},
			{
				address: toAddress(OneVesting.token),
				abi: erc20ABI,
				chainId: 1,
				functionName: 'decimals'
			}
		]
	});

	const totalToVest = useMemo((): string => {
		return formatAmount(toNormalizedBN(OneVesting.amount, Number(token?.[1].result || 18)).normalized || 0, 4, 4);
	}, [token]);

	const alreadyVested = useMemo((): number => {
		const totalToVest = toNormalizedBN(OneVesting.amount, Number(token?.[1].result || 18));
		const start = new Date(Number(OneVesting.vesting_start) * 1000);
		const end = new Date(Number(OneVesting.vesting_start) * 1000 + Number(OneVesting.vesting_duration) * 1000);
		const now = new Date();
		if (now < start) {
			return 0;
		}
		if (now > end) {
			return Number(totalToVest.normalized);
		}
		const seconds = differenceInSeconds(now, start);
		const totalSeconds = differenceInSeconds(end, start);
		const percentage = seconds / totalSeconds;
		const vested = Number(totalToVest.normalized) * percentage;
		return Number(vested);
	}, [token, nonce]);

	useIntervalEffect(() => {
		set_nonce(nonce + 1);
	}, 1000);

	return (
		<div className={'box-0 mt-6 flex w-full flex-row items-center justify-between px-6 py-4'}>
			<div className={'flex gap-4'}>
				<div>
					<ImageWithFallback
						src={`${process.env.SMOL_ASSETS_URL}/token/1/${OneVesting.token}/logo-128.png`}
						width={42}
						height={42}
						alt={''}
					/>
				</div>
				<div>
					<b>{token?.[0].result}</b>
					<small className={'font-number text-neutral-900/60'}>{toAddress(OneVesting.token)}</small>
				</div>
			</div>
			<div>
				<p className={'font-number text-sm text-neutral-900'}>
					<b suppressHydrationWarning>
						<Counter
							value={alreadyVested}
							decimals={Number(token?.[1] || 18)}
						/>

						{` / ${totalToVest} ${token?.[0].result || ''}`}
					</b>
				</p>
				<Button
					variant={'outlined'}
					className={'mt-2 !h-8 w-full'}>
					{'Claim'}
				</Button>
			</div>
		</div>
	);
}

function Vesting(): ReactElement {
	const {currentStep, set_currentStep} = useVesting();

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:text-5xl'}>
					{'One vesting to not rug you.'}
				</h1>
				<b
					className={
						'mt-4 w-full whitespace-pre text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'
					}>
					{'Mom, can I get a vesting? Pls pls pls pls!\nI need to buy more YFI!'}
				</b>
			</div>

			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.CONFIGURATION);
					document?.getElementById('configuration')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}}
			/>

			<OneVestionRendering />

			<div
				id={'configuration'}
				className={`pt-10 transition-opacity ${
					[Step.SUMMARY, Step.NEW_DEPLOY, Step.CONFIGURATION].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewVestingConfiguration />
			</div>

			<div
				id={'summary'}
				className={`overflow-x-hidden pt-10 transition-opacity ${
					[Step.SUMMARY, Step.NEW_DEPLOY].includes(currentStep)
						? 'opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				}`}>
				<ViewVestingSummary />
			</div>
		</div>
	);
}

export default function VestingWrapper(): ReactElement {
	return (
		<VestingContextApp>
			<>
				<DefaultSeo
					title={'Vesting - SmolDapp'}
					defaultTitle={'Vesting - SmolDapp'}
					description={'Wen token'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/vesting',
						site_name: 'Vesting - SmolDapp',
						title: 'Vesting - SmolDapp',
						description: 'Wen token',
						images: [
							{
								url: 'https://smold.app/og_vesting.png',
								width: 800,
								height: 400,
								alt: 'Vesting'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}}
				/>
				<Vesting />
			</>
		</VestingContextApp>
	);
}
