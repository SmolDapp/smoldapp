import React, {Fragment, useMemo, useState} from 'react';
import Image from 'next/image';
import SocialMediaCard from 'components/common/SocialMediaCard';
import SectionDonate from 'components/SectionDonate';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {useAccount, useEnsAvatar} from 'wagmi';
import {LogoENS} from '@icons/LogoENS';
import LogoEtherscan from '@icons/LogoEtherscan';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';
import {Counter} from '@common/Counter';

function SectionGoal(): ReactElement {
	const {connector} = useAccount();
	const {openLoginModal, address, onDesactivate} = useWeb3();

	if (!connector || !address) {
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
					<Button
						onClick={openLoginModal}
						variant={'filled'}
						className={'mt-2 !h-8 min-h-[32px] w-full cursor-pointer'}>
						<p className={'text-xs font-semibold'}>{'Connect wallet'}</p>
					</Button>
				</div>
			</div>
		);
	}
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
				<div className={'mt-2 flex w-full gap-2'}>
					<Button
						onClick={() => copyToClipboard(address)}
						variant={'filled'}
						className={'!h-8 min-h-[32px] w-full'}>
						<p className={'text-xs font-semibold'}>{'Copy Address'}</p>
					</Button>
					<Button
						onClick={onDesactivate}
						variant={'filled'}
						className={'!h-8 min-h-[32px] w-full'}>
						<p className={'text-xs font-semibold'}>{'Disconnect'}</p>
					</Button>
				</div>
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
					<h1 className={'flex flex-row items-center text-xl tracking-tight text-neutral-900 md:text-3xl'}>
						{ens || truncateHex(address, 6)}
					</h1>
					<p className={'font-number text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
						<span className={'hidden md:inline'}>{address}</span>
						<span className={'inline pl-1 md:hidden'}>{truncateHex(address, 8)}</span>
					</p>
				</span>
			</div>
			<p className={'mt-2 min-h-[30px] text-sm text-neutral-500 md:mt-4 md:min-h-[60px] md:text-base'}>
				{'Simple, smart and elegant dapps, designed to make your crypto journey a little bit easier.'}
			</p>
			<div className={'mt-auto items-center justify-between pt-6 md:flex'}>
				<div className={'hidden flex-row space-x-4 md:flex'}>
					<SectionSocials />
				</div>
			</div>
		</div>
	);
}

function SectionSocials(): ReactElement {
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

function SectionYourTokens(): ReactElement {
	const {safeChainID} = useChainID();
	const {tokenList} = useTokenList();
	const [possibleTokens, set_possibleTokens] = useState<TDict<TToken>>({});
	const {getBalance} = useWallet();

	/* 🔵 - Yearn Finance **************************************************************************
	 ** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	 ** will be used to populate the tokenToDisperse token combobox.
	 ** Only the tokens in that list will be displayed as possible destinations.
	 **********************************************************************************************/
	useDeepCompareEffect((): void => {
		const possibleDestinationsTokens: TDict<TToken> = {};
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainID: safeChainID,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol,
				decimals: wrappedToken.decimals,
				logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-32.png`
			};
		}
		for (const eachToken of Object.values(tokenList)) {
			if (eachToken.address === ETH_TOKEN_ADDRESS) {
				continue;
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_possibleTokens(possibleDestinationsTokens);
	}, [tokenList, safeChainID]);

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(possibleTokens)) {
			if (getBalance(dest.address).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokens, getBalance]);

	return (
		<Fragment>
			{filteredBalances.map(token => (
				<div
					key={token.address}
					className={'box-0 mt-2 flex w-full flex-row items-center justify-between p-4'}>
					<div className={'flex gap-4'}>
						<div>
							<ImageWithFallback
								src={`${process.env.SMOL_ASSETS_URL}/token/1/${token.address}/logo-128.png`}
								width={32}
								height={32}
								alt={''}
							/>
						</div>
						<div>
							<b>{token.symbol}</b>
							<small className={'font-number text-neutral-900/60'}>{toAddress(token.address)}</small>
						</div>
					</div>
					<div>
						<p className={'font-number text-right text-sm text-neutral-900'}>
							<b suppressHydrationWarning>
								<Counter value={Number(getBalance(token.address).normalized)} />
							</b>
							<small className={'font-number text-neutral-900/60'}>{'$ 1414'}</small>
						</p>
					</div>
				</div>
			))}
		</Fragment>
	);
}

function Index(): ReactElement {
	return (
		<Fragment>
			<div className={'relative mb-10 w-full py-24'}>
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
							<SectionGoal />
							<div className={'col-span-7 mt-auto flex w-full justify-between pt-2 md:hidden'}>
								<SectionSocials />
							</div>
						</div>
					</div>
				</section>
			</div>
			<div>
				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<SectionDonate />
				</section>
			</div>

			<div>
				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<div className={'flex flex-row items-center justify-between'}>
						<h2 className={'scroll-m-20 pb-4 text-xl text-neutral-500'}>{'Your tokens'}</h2>
					</div>
					<SectionYourTokens />
				</section>
			</div>
			<div className={'h-44'} />
		</Fragment>
	);
}

export default Index;
