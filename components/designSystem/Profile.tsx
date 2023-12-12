import {type ReactElement, useMemo, useState} from 'react';
import Image from 'next/image';
import {useAccount, useBalance, useConnect, useEnsAvatar, usePublicClient} from 'wagmi';
import {IconChevron} from '@icons/IconChevron';
import {IconWallet} from '@icons/IconWallet';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import {useIsMounted, useUpdateEffect} from '@react-hookz/web';
import {getColorFromAdddress, isAddress, safeAddress} from '@utils/tools.address';
import {supportedTestNetworks} from '@utils/tools.chains';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toSafeChainID, useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {Counter} from '@common/Counter';
import {ImageWithFallback} from '@common/ImageWithFallback';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from '@common/Primitives/Commands';
import {TooltipContent} from '@common/Primitives/Tooltip';

import type {TAddress} from '@yearn-finance/web-lib/types';

export function ProfileAvatar(props: {
	src: string | null | undefined;
	address: TAddress | undefined;
	isLoading: boolean;
}): ReactElement {
	const [imageSrc, set_imageSrc] = useState(props.src);
	const hasAvatar = useMemo(() => imageSrc !== undefined, [imageSrc]);
	const addressColor = useMemo(() => getColorFromAdddress({address: toAddress(props.address)}), [props.address]);

	useUpdateEffect((): void => {
		set_imageSrc(props.src);
	}, [props.src]);

	if (props.isLoading) {
		return <div className={'skeleton-full h-10 w-10 min-w-[40px]'} />;
	}
	if (!hasAvatar && !isAddress(props.address)) {
		return <div className={'h-10 w-10 min-w-[40px] rounded-full bg-neutral-200'} />;
	}
	if (!hasAvatar) {
		return (
			<div
				style={{background: addressColor}}
				className={'h-10 w-10 min-w-[40px] rounded-full'}
			/>
		);
	}
	return (
		<div className={'h-10 w-10 min-w-[40px] rounded-full bg-neutral-200/40'}>
			<Image
				key={props.address}
				id={props.address}
				className={'rounded-full'}
				unoptimized
				src={imageSrc || ''}
				width={40}
				height={40}
				alt={''}
				onError={() => set_imageSrc(undefined)}
			/>
		</div>
	);
}

export function ProfileAddress(props: {
	address: TAddress | undefined;
	ens: string | undefined;
	isConnecting: boolean;
}): ReactElement {
	const isMounted = useIsMounted();

	if (!isMounted() || props.isConnecting) {
		return (
			<div className={'grid w-full gap-2'}>
				<div className={'skeleton-lg h-4 w-full'} />
				<div className={'skeleton-lg h-4 w-2/3'} />
			</div>
		);
	}

	if (!props.ens) {
		return (
			<div className={'grid w-full gap-2'}>
				<b className={'text-base leading-4'}>{props.address?.substring(0, 6)}</b>
				<Tooltip.Provider delayDuration={250}>
					<Tooltip.Root>
						<Tooltip.Trigger className={'flex w-fit items-center gap-1'}>
							<small>{safeAddress({address: props.address})}</small>
						</Tooltip.Trigger>
						<TooltipContent
							side={'right'}
							className={'TooltipContent bg-primary !p-0'}>
							<button
								onClick={() => copyToClipboard(toAddress(props.address))}
								className={'flex cursor-copy px-2 py-1.5'}>
								<small className={'font-number text-xxs text-neutral-900/70'}>
									{toAddress(props.address)}
								</small>
							</button>
							<Tooltip.Arrow
								className={'fill-primary'}
								width={11}
								height={5}
							/>
						</TooltipContent>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		);
	}
	return (
		<div className={'grid w-full gap-2'}>
			<b className={'text-base leading-4'}>
				{safeAddress({address: props.address, ens: props.ens, addrOverride: 'Your Wallet'})}
			</b>
			<Tooltip.Provider delayDuration={250}>
				<Tooltip.Root>
					<Tooltip.Trigger className={'flex w-fit items-center gap-1'}>
						<small>{safeAddress({address: props.address})}</small>
					</Tooltip.Trigger>
					<TooltipContent
						side={'right'}
						className={'TooltipContent bg-primary !p-0'}>
						<button
							onClick={() => copyToClipboard(toAddress(props.address))}
							className={'flex cursor-copy px-2 py-1.5'}>
							<small className={'font-number text-xxs text-neutral-900/70'}>
								{toAddress(props.address)}
							</small>
						</button>
						<Tooltip.Arrow
							className={'fill-primary'}
							width={11}
							height={5}
						/>
					</TooltipContent>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	);
}

export function Profile(): ReactElement {
	const {address, ens} = useWeb3();
	const {isConnecting} = useAccount();
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({chainId: 1, name: ens});

	return (
		<div className={'flex gap-2'}>
			<ProfileAvatar
				isLoading={isLoadingAvatar || isConnecting}
				address={address}
				src={avatar}
			/>
			<ProfileAddress
				isConnecting={isConnecting}
				address={address}
				ens={ens}
			/>
		</div>
	);
}

export function NetworkSelector(): ReactElement {
	const isMounted = useIsMounted();
	const {onSwitchChain} = useWeb3();
	const publicClient = usePublicClient();
	const {connectors} = useConnect();
	const safeChainID = toSafeChainID(publicClient?.chain.id, Number(process.env.BASE_CHAINID));
	type TNetwork = {value: number; label: string};

	const supportedNetworks = useMemo((): TNetwork[] => {
		const injectedConnector = connectors.find((e): boolean => e.id.toLocaleLowerCase() === 'injected');
		if (injectedConnector) {
			const chainsForInjected = injectedConnector.chains;
			const testnet = supportedTestNetworks;

			return chainsForInjected
				.filter(({id}): boolean => {
					if (testnet.find((network): boolean => network.id === id)) {
						return false;
					}
					return true;
				})
				.map((network): TNetwork => ({value: network.id, label: network.name}));
		}
		return supportedNetworks.map((network): TNetwork => network);
	}, [connectors]);

	const currentNetwork = useMemo(
		(): TNetwork | undefined => supportedNetworks.find((network): boolean => network.value === safeChainID),
		[safeChainID, supportedNetworks]
	);

	const [isOpen, set_isOpen] = useState(false);
	return (
		<Popover.Root
			open={isOpen}
			onOpenChange={set_isOpen}>
			<Popover.Trigger asChild>
				<button
					role={'combobox'}
					aria-expanded={isOpen}
					className={cl(
						'flex w-full items-center justify-between rounded-lg p-2',
						'bg-neutral-200 hover:bg-neutral-300 transition-colors'
					)}>
					<p className={'truncate text-xs'}>
						{isMounted() && currentNetwork?.label ? currentNetwork?.label : 'Select chain...'}
					</p>
					<IconChevron className={'h-4 w-4 rotate-90'} />
				</button>
			</Popover.Trigger>

			<Popover.Content
				style={{boxShadow: 'rgba(36, 40, 51, 0.08) 0px 0px 20px 8px'}}
				className={'PopoverContent z-50 rounded-lg bg-neutral-0 p-0'}>
				<Command>
					<CommandInput placeholder={'Search chain...'} />
					<CommandEmpty>{'No chain found.'}</CommandEmpty>
					<CommandGroup className={'max-h-48 overflow-y-auto'}>
						{supportedNetworks.map(network => (
							<CommandItem
								key={network.value}
								value={network.label}
								className={cl(
									'cursor-pointer bg-neutral-0 p-0 transition-colors hover:bg-neutral-200',
									currentNetwork?.value === network.value ? 'bg-neutral-200' : ''
								)}
								onSelect={selectedNetwork => {
									if (selectedNetwork === currentNetwork?.label) {
										return;
									}
									const chain = supportedNetworks.find(
										network => network.label.toLowerCase() === selectedNetwork
									);
									onSwitchChain(chain?.value || 1);
									set_isOpen(false);
								}}>
								<ImageWithFallback
									width={16}
									height={16}
									className={'mr-2'}
									alt={network.label}
									src={`${process.env.SMOL_ASSETS_URL}/chain/${network.value}/logo-32.png`}
								/>
								{network.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}

export function CoinBalance(): ReactElement {
	const isMounted = useIsMounted();
	const {address} = useWeb3();
	const {chainID} = useChainID();
	const currentChain = getNetwork(chainID || 1).nativeCurrency;
	const {data: balance} = useBalance({chainId: chainID || 1, address});

	if (!isMounted()) {
		return (
			<div>
				<small>{'Coin'}</small>
				<div className={'skeleton-lg h-8 w-2/3'} />
			</div>
		);
	}
	return (
		<div>
			<small>{currentChain.symbol || 'ETH'}</small>
			<strong>
				<Counter
					className={'text-base leading-8'}
					value={Number(balance?.formatted || 0)}
					decimals={6}
				/>
			</strong>
		</div>
	);
}

export function ConnectProfile(): ReactElement {
	const {onConnect} = useWeb3();

	return (
		<section
			className={cl(
				'h-[145px] rounded-t-lg bg-neutral-0',
				'px-10 pb-6 pt-5',
				'flex flex-col justify-center items-center'
			)}>
			<div className={'mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-300'}>
				<IconWallet className={'h-6 w-6 text-neutral-700'} />
			</div>
			<div className={'w-full'}>
				<button
					onClick={onConnect}
					className={'h-8 w-full rounded-lg bg-primary text-xs transition-colors hover:bg-primaryHover'}>
					{'Connect Wallet'}
				</button>
			</div>
		</section>
	);
}

export function SkeletonPlaceholder(): ReactElement {
	return (
		<section className={'p-4'}>
			<div className={'flex gap-2'}>
				<ProfileAvatar
					isLoading
					address={undefined}
					src={undefined}
				/>
				<ProfileAddress
					isConnecting
					address={undefined}
					ens={undefined}
				/>
			</div>

			<hr className={'mb-2 mt-4 text-neutral-200'} />

			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small className={'text-xxs'}>{'Chain'}</small>
					<NetworkSelector />
				</div>
				<div>
					<small className={'text-xxs'}>{'Coin'}</small>
					<div className={'skeleton-lg mt-1 h-6 w-2/3'} />
				</div>
			</div>
		</section>
	);
}

export function NavProfile(): ReactElement {
	const isMounted = useIsMounted();
	const {address} = useWeb3();

	if (!isMounted()) {
		return <SkeletonPlaceholder />;
	}

	if (!isAddress(address)) {
		return <ConnectProfile />;
	}

	return (
		<section className={'p-4'}>
			<Profile />

			<hr className={'mb-2 mt-4 text-neutral-200'} />

			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small>{'Chain'}</small>
					<NetworkSelector />
				</div>
				<CoinBalance />
			</div>
		</section>
	);
}
