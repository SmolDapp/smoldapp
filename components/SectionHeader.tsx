import React, {Fragment, useMemo} from 'react';
import Image from 'next/image';
import SocialMediaCard from 'components/common/SocialMediaCard';
import {useEnsAvatar} from 'wagmi';
import {LogoENS} from '@icons/LogoENS';
import LogoEtherscan from '@icons/LogoEtherscan';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

function SectionConnect(): ReactElement {
	const {openLoginModal, address, onDesactivate} = useWeb3();

	return (
		<div
			className={
				'font-number col-span-7 flex w-full flex-col border-l-0 border-neutral-200 pl-0 text-xs md:col-span-4 md:border-l md:pl-10 md:text-sm'
			}>
			<div className={'relative flex h-full w-full flex-col items-center justify-center'}>
				<div className={'box-0 grid h-full w-full grid-cols-3 grid-rows-4 gap-2 p-4'}>
					<div className={'h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-2 row-span-3 h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-1 row-span-2 h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-3 row-span-2 h-full w-full rounded-md bg-primary-100'} />
				</div>
				{address ? (
					<div className={'mt-2 flex w-full gap-2'}>
						<Button
							onClick={() => copyToClipboard(address)}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Copy Address'}
							</p>
						</Button>
						<Button
							onClick={onDesactivate}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Disconnect'}
							</p>
						</Button>
					</div>
				) : (
					<div className={'mt-2 flex w-full gap-2'}>
						<Button
							onClick={openLoginModal}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Connect wallet'}
							</p>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

function Avatar({src, address}: {src: string | null | undefined; address: TAddress}): ReactElement {
	const randomColor = useMemo((): string => {
		const addressAsNumber = parseInt(address.slice(2), 16) % 0xffffff;
		return `#${Math.floor(addressAsNumber).toString(16)}`;
	}, [address]);

	return (
		<div className={'h-14 max-h-[56px] min-h-[56px] w-12 min-w-[56px] max-w-[56px] rounded-2xl bg-neutral-200'}>
			{!src ? (
				<div
					suppressHydrationWarning
					className={'!h-14 !w-14 rounded-2xl object-cover'}
					style={{backgroundColor: randomColor}}>
					<div />
				</div>
			) : (
				<Image
					src={src}
					alt={''}
					className={'!h-14 !w-14 rounded-2xl object-cover outline outline-neutral-100'}
					width={400}
					height={400}
					unoptimized
				/>
			)}
		</div>
	);
}

function SectionProfile(): ReactElement {
	const {address, ens} = useWeb3();
	const {data: ensAvatar} = useEnsAvatar({name: ens});

	return (
		<div className={'relative col-span-8 flex flex-col'}>
			<div className={'ml-0 mt-2 flex flex-row items-center space-x-2 md:-ml-2 md:mt-0 md:space-x-4'}>
				<Avatar
					address={toAddress(address)}
					src={ensAvatar}
				/>
				<span>
					<h1
						suppressHydrationWarning
						className={'flex flex-row items-center text-xl tracking-tight text-neutral-900 md:text-3xl'}>
						{ens || truncateHex(address, 6)}
					</h1>
					<p className={'font-number text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
						<span
							suppressHydrationWarning
							className={'hidden md:inline'}>
							{address}
						</span>
						<span
							suppressHydrationWarning
							className={'inline pl-1 md:hidden'}>
							{truncateHex(address, 8)}
						</span>
					</p>
				</span>
			</div>
			<p className={'mt-2 min-h-[30px] text-sm text-neutral-500 md:mt-4 md:min-h-[60px] md:text-base'}>
				{'Simple, smart and elegant dapps, designed to make your crypto journey a little bit easier.'}
			</p>
			<div className={'mt-auto items-center justify-between pt-6 md:flex'}>
				<div className={'hidden flex-row space-x-4 md:flex'}>
					<SectionLinks />
				</div>
			</div>
		</div>
	);
}

function SectionLinks(): ReactElement {
	const {address, ens} = useWeb3();

	return (
		<Fragment>
			<SocialMediaCard
				href={`https://etherscan.io/address/${address}`}
				className={address ? '' : 'pointer-events-none opacity-40'}
				tooltip={'View on Etherscan'}
				icon={<LogoEtherscan />}
			/>
			<SocialMediaCard
				href={`https://app.ens.domains/${ens || ''}`}
				className={ens ? '' : 'pointer-events-none opacity-40'}
				tooltip={'Manage ENS profile'}
				icon={<LogoENS />}
			/>
		</Fragment>
	);
}

function SectionHeader(): ReactElement {
	return (
		<Fragment>
			<div className={'relative w-full py-24'}>
				<div className={'absolute inset-0 z-0'}>
					<Image
						src={'/hero.jpg'}
						alt={''}
						className={'absolute inset-0 h-full w-full object-cover'}
						width={1500}
						height={500}
					/>
				</div>

				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<div className={'flex flex-col justify-center'}>
						<div className={'box-0 relative grid grid-cols-1 gap-10 p-6 shadow md:grid-cols-12'}>
							<SectionProfile />
							<SectionConnect />
							<div className={'col-span-7 mt-auto flex w-full justify-between pt-2 md:hidden'}>
								<SectionLinks />
							</div>
						</div>
					</div>
				</section>
			</div>
		</Fragment>
	);
}

export default SectionHeader;
