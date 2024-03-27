import {Fragment, useState} from 'react';
import {NetworkPopoverSelector} from 'components/designSystem/NetworkSelector/Popover';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {cl, isAddress} from '@builtbymom/web3/utils';
import {Dialog, Transition} from '@headlessui/react';
import {IconHamburger} from '@icons/IconHamburger';
import {ConnectButton} from '@rainbow-me/rainbowkit';
import {useIsMounted} from '@react-hookz/web';

import {SideMenuNav} from '../SideMenuNav';
import {CoinBalance} from '../SideMenuProfile/CoinBalance';
import {ProfileBox} from '../SideMenuProfile/ProfileBox';
import {SkeletonPlaceholder} from '../SideMenuProfile/SkeletonPlaceholder';

import type {ReactElement} from 'react';

export function SideMenuMobile(): ReactElement {
	const [isOpen, set_isOpen] = useState(false);
	const isMounted = useIsMounted();
	const {address} = useWeb3();

	if (!isMounted()) {
		return (
			<div className={'w-full'}>
				<SkeletonPlaceholder />
			</div>
		);
	}
	if (!isAddress(address)) {
		return <ConnectButton />;
	}

	return (
		<>
			<div className={cl('py-4 pl-4 pr-6 bg-neutral-0 w-full rounded-lg')}>
				<div className={'mb-4 flex items-center justify-between'}>
					<ProfileBox />
					<button
						className={'rounded-full p-2 transition-colors hover:bg-neutral-200'}
						onClick={() => set_isOpen(true)}>
						<IconHamburger className={'size-4'} />
					</button>
				</div>
				<div className={'flex items-center justify-between gap-6'}>
					<div>
						<small>{'Chain'}</small>
						<NetworkPopoverSelector />
					</div>
					<div className={'text-end'}>
						<CoinBalance />
					</div>
				</div>
			</div>
			<Transition.Root
				show={isOpen}
				as={Fragment}>
				<Dialog
					as={'div'}
					className={'relative z-[1000] block w-full md:hidden'}
					onClose={() => set_isOpen(!isOpen)}>
					<Transition.Child
						as={Fragment}
						enter={'ease-in duration-300'}
						enterFrom={'translate-y-full opacity-0'}
						enterTo={'translate-y-0 opacity-100'}
						leave={'ease-out duration-300'}
						leaveFrom={'translate-y-0 opacity-100'}
						leaveTo={'translate-y-full opacity-0'}>
						<div className={'bg-primary-900/40 fixed inset-0 backdrop-blur-sm transition-opacity'} />
					</Transition.Child>

					<div className={'fixed inset-0 z-[1001] w-screen overflow-y-auto'}>
						<div
							className={
								'flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'
							}>
							<Transition.Child
								as={Fragment}
								enter={'ease-in duration-300'}
								enterFrom={'translate-y-full opacity-0'}
								enterTo={'translate-y-0 opacity-100'}
								leave={'ease-out duration-300'}
								leaveFrom={'translate-y-0 opacity-100'}
								leaveTo={'translate-y-full opacity-0'}>
								<Dialog.Panel
									className={cl(
										'relative overflow-hidden rounded-md !bg-neutral-0 transition-all w-full'
									)}>
									<SideMenuNav />
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
}
