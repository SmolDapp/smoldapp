import React, {cloneElement, Fragment, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import assert from 'assert';
import {useConnect, usePublicClient} from 'wagmi';
import {Listbox, Transition} from '@headlessui/react';
import {useIsMounted} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toSafeChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import IconChevronBottom from '@yearn-finance/web-lib/icons/IconChevronBottom';
import IconWallet from '@yearn-finance/web-lib/icons/IconWallet';
import {truncateHex} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {AnchorHTMLAttributes, DetailedHTMLProps, ReactElement} from 'react';
import type {Chain} from 'wagmi';

const Link = (props: (DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) & {tag: ReactElement}): ReactElement => {
	const {tag, ...rest} = props;
	const Element = cloneElement(tag, rest);
	return Element;
};

export type TMenu = {path: string, label: string | ReactElement, target?: string};
export type TNavbar = {
	nav: TMenu[],
	linkComponent?: ReactElement,
	currentPathName: string
};
function Navbar({nav, linkComponent = <a />, currentPathName}: TNavbar): ReactElement {
	return (
		<nav className={'yearn--nav'}>
			{nav.map((option): ReactElement => (
				<Link
					tag={linkComponent}
					key={option.path}
					target={option.target}
					href={option.path}>
					<p className={`yearn--header-nav-item ${currentPathName === option.path ? 'active' : '' }`}>
						{option.label}
					</p>
				</Link>
			))}
		</nav>
	);
}

function NetworkButton({label, isDisabled, onClick}: {
	label: string,
	isDisabled?: boolean,
	onClick?: () => void,
}): ReactElement {
	return (
		<button
			disabled={isDisabled}
			onClick={onClick}
			suppressHydrationWarning
			className={'yearn--header-nav-item mr-4 hidden !cursor-default flex-row items-center border-0 p-0 text-sm hover:!text-neutral-500 md:flex'}>
			<div suppressHydrationWarning className={'relative flex flex-row items-center'}>
				{label}
			</div>
		</button>
	);
}

function CurrentNetworkButton({label, value, isOpen}: {
	label: string,
	value: number,
	isOpen: boolean
}): ReactElement {
	const [src, set_src] = useState<string | undefined>(undefined);

	useEffect((): void => {
		if (value) {
			set_src(`chains/${value}.svg`);
		}
	}, [value]);

	return (
		<Listbox.Button
			suppressHydrationWarning
			className={'yearn--header-nav-item flex flex-row items-center border-0 p-0 text-xs md:flex md:text-sm'}>
			<div
				suppressHydrationWarning
				className={'relative flex flex-row items-center truncate whitespace-nowrap text-xs md:text-sm'}>
				{src ? (
					<Image
						suppressHydrationWarning
						id={value.toString()}
						className={'mr-2 min-h-[20px] min-w-[20px]'}
						src={src}
						width={20}
						height={20}
						alt={label} />
				) : (
					<div
						className={'mr-2 min-h-[20px] min-w-[20px] animate-pulse rounded-full bg-neutral-200'} />
				)}
				{label}
			</div>
			<div className={'ml-1 md:ml-2'}>
				<IconChevronBottom
					className={`h-3 w-3 transition-transform md:h-5 md:w-4 ${isOpen ? '-rotate-180' : 'rotate-0'}`} />
			</div>
		</Listbox.Button>
	);
}

export type TNetwork = {value: number, label: string};
export function NetworkSelector({networks}: {networks: number[]}): ReactElement {
	const {onSwitchChain} = useWeb3();
	const publicClient = usePublicClient();
	const {connectors} = useConnect();
	const safeChainID = toSafeChainID(publicClient?.chain.id, Number(process.env.BASE_CHAINID));
	const isMounted = useIsMounted();

	const supportedNetworks = useMemo((): TNetwork[] => {
		const injectedConnector = connectors.find((e): boolean => (e.id).toLocaleLowerCase() === 'injected');
		assert(injectedConnector, 'No injected connector found');
		const chainsForInjected = injectedConnector.chains;

		return (
			chainsForInjected
				.filter(({id}): boolean => id !== 1337 && ((networks.length > 0 && networks.includes(id)) || true))
				.map((network: Chain): TNetwork => (
					{value: network.id, label: network.name}
				))
		);
	}, [connectors, networks]);

	const	currentNetwork = useMemo((): TNetwork | undefined => (
		supportedNetworks.find((network): boolean => network.value === safeChainID)
	), [safeChainID, supportedNetworks]);

	if (supportedNetworks.length === 1) {
		if (publicClient?.chain.id === 1337) {
			return <NetworkButton label={'Localhost'} isDisabled />;
		}
		if (currentNetwork?.value === supportedNetworks[0]?.value) {
			return <NetworkButton label={supportedNetworks[0]?.label || 'Ethereum'} isDisabled />;
		}
		return (
			<NetworkButton
				label={'Invalid Network'}
				onClick={(): void => onSwitchChain(supportedNetworks[0].value)} />
		);
	}

	if (!isMounted() || !currentNetwork) {
		<div className={'relative z-50 mr-4'}>
			<div className={'h-10 w-full animate-pulse bg-neutral-100'} />
		</div>;
	}

	return (
		<div className={'relative z-50 mr-4'}>
			<Listbox
				value={safeChainID}
				onChange={(value: unknown): void => onSwitchChain((value as {value: number}).value)}>
				{({open}): ReactElement => (
					<>
						<CurrentNetworkButton
							label={currentNetwork?.label || 'Ethereum'}
							value={currentNetwork?.value || 1}
							isOpen={open} />
						<Transition
							appear
							show={open}
							as={Fragment}>
							<div>
								<Transition.Child
									as={Fragment}
									enter={'ease-out duration-300'}
									enterFrom={'opacity-0'}
									enterTo={'opacity-100'}
									leave={'ease-in duration-200'}
									leaveFrom={'opacity-100'}
									leaveTo={'opacity-0'}>
									<div className={'fixed inset-0 bg-neutral-0/60'} />
								</Transition.Child>
								<Transition.Child
									as={Fragment}
									enter={'transition duration-100 ease-out'}
									enterFrom={'transform scale-95 opacity-0'}
									enterTo={'transform scale-100 opacity-100'}
									leave={'transition duration-75 ease-out'}
									leaveFrom={'transform scale-100 opacity-100'}
									leaveTo={'transform scale-95 opacity-0'}>
									<Listbox.Options className={'absolute -inset-x-24 z-50 flex items-center justify-center pt-2 opacity-0 transition-opacity'}>
										<div className={'w-fit border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xxs text-neutral-900'}>
											{supportedNetworks.map((network): ReactElement => (
												<Listbox.Option key={network.value} value={network}>
													{({active}): ReactElement => (
														<div
															data-active={active}
															className={'yearn--listbox-menu-item text-sm'}>
															{network?.label || 'Ethereum'}
														</div>
													)}
												</Listbox.Option>
											))}
										</div>
									</Listbox.Options>
								</Transition.Child>
							</div>
						</Transition>
					</>
				)}
			</Listbox>
		</div>
	);
}

export function WalletSelector(): ReactElement {
	const {options, isActive, address, ens, lensProtocolHandle, openLoginModal, onDesactivate, onSwitchChain} = useWeb3();
	const [walletIdentity, set_walletIdentity] = useState<string | undefined>(undefined);
	const isMounted = useIsMounted();

	useEffect((): void => {
		if (!isMounted()) {
			return;
		}
		if (!isActive && address) {
			set_walletIdentity('Invalid Network');
		} else if (ens) {
			set_walletIdentity(ens);
		} else if (lensProtocolHandle) {
			set_walletIdentity(lensProtocolHandle);
		} else if (address) {
			set_walletIdentity(truncateHex(address, 6));
		} else {
			set_walletIdentity(undefined);
		}
	}, [ens, lensProtocolHandle, address, isActive, isMounted]);

	return (
		<>
			<div
				onClick={(): void => {
					if (isActive) {
						onDesactivate();
					} else if (!isActive && address) {
						onSwitchChain(options?.defaultChainID || 1);
					} else {
						openLoginModal();
					}
				}}>
				<div suppressHydrationWarning className={'font-inter text-sm font-medium'}>
					{walletIdentity ? (walletIdentity) : (
						<span>
							<IconWallet className={'yearn--header-nav-item mt-0.5 block h-4 w-4 md:hidden'} />
							<span className={'relative hidden h-8 cursor-pointer items-center justify-center !rounded-md border border-transparent bg-neutral-900 px-2 text-xs font-normal text-neutral-0 transition-all hover:bg-neutral-800 md:flex'}>
								{'Connect wallet'}
							</span>
						</span>
					)}
				</div>
			</div>
			<div
				onClick={(): void => {
					if (isActive) {
						onDesactivate();
					} else if (!isActive && address) {
						onSwitchChain(options?.defaultChainID || 1);
					} else {
						openLoginModal();
					}
				}}
				className={cl('fixed inset-x-0 bottom-0 z-[87] border-t border-neutral-900 bg-neutral-0 md:hidden', walletIdentity ? 'hidden pointer-events-none' : '')}>
				<div className={'flex flex-col items-center justify-center pb-6 pt-4 text-center'}>
					{'You are not connected. Please connect to a wallet to continue.'}
					<Button className={'mt-3 space-x-2'}>
						<IconWallet className={'h-4 w-4'} />
						<p>{'Connect wallet'}</p>
					</Button>
				</div>

			</div>
		</>
	);
}

export type THeader = {
	logo: ReactElement,
	extra?: ReactElement,
	linkComponent?: ReactElement,
	nav: TMenu[],
	supportedNetworks?: number[],
	currentPathName: string,
	onOpenMenuMobile: () => void
}
function HeaderAlt({
	logo,
	extra,
	linkComponent,
	nav,
	currentPathName,
	supportedNetworks,
	onOpenMenuMobile
}: THeader): ReactElement {
	return (
		<header className={'yearn--header'}>
			<Navbar
				linkComponent={linkComponent}
				currentPathName={currentPathName}
				nav={nav} />
			<div className={'flex w-1/3 md:hidden'}>
				<button onClick={onOpenMenuMobile}>
					<span className={'sr-only'}>{'Open menu'}</span>
					<svg
						className={'text-neutral-500'}
						width={'20'}
						height={'20'}
						viewBox={'0 0 24 24'}
						fill={'none'}
						xmlns={'http://www.w3.org/2000/svg'}>
						<path d={'M2 2C1.44772 2 1 2.44772 1 3C1 3.55228 1.44772 4 2 4H22C22.5523 4 23 3.55228 23 3C23 2.44772 22.5523 2 22 2H2Z'} fill={'currentcolor'}/>
						<path d={'M2 8C1.44772 8 1 8.44772 1 9C1 9.55228 1.44772 10 2 10H14C14.5523 10 15 9.55228 15 9C15 8.44772 14.5523 8 14 8H2Z'} fill={'currentcolor'}/>
						<path d={'M1 15C1 14.4477 1.44772 14 2 14H22C22.5523 14 23 14.4477 23 15C23 15.5523 22.5523 16 22 16H2C1.44772 16 1 15.5523 1 15Z'} fill={'currentcolor'}/>
						<path d={'M2 20C1.44772 20 1 20.4477 1 21C1 21.5523 1.44772 22 2 22H14C14.5523 22 15 21.5523 15 21C15 20.4477 14.5523 20 14 20H2Z'} fill={'currentcolor'}/>
					</svg>
				</button>
			</div>
			<div className={'flex w-1/3 justify-center'}>
				<div className={'relative h-8 w-8'}>
					{logo}
				</div>
			</div>
			<div className={'flex w-1/3 items-center justify-end'}>
				<NetworkSelector networks={supportedNetworks || []} />
				<WalletSelector />
				{extra}
			</div>
		</header>
	);
}

export default HeaderAlt;
