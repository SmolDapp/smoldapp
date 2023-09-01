import React, {useState} from 'react';
import Link from 'next/link';
import Meta from 'components/common/Meta';
import Logo from 'components/icons/logo';
import thumbnailVariants from 'utils/animations';
import {AnimatePresence, motion} from 'framer-motion';
import IconChevronBottom from '@yearn-finance/web-lib/icons/IconChevronBottom';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {NetworkSelector, WalletSelector} from './HeaderAlt';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

function SideBar(): ReactElement {
	const [isSidebarOpen, set_isSidebarOpen] = useState(false);

	function renderNoNavView(): ReactElement {
		return (
			<div
				className={cl('fixed top-0 left-0 z-50 flex flex-col pt-1 px-2 transition-all duration-75',
					!isSidebarOpen ? 'opacity-100' : 'opacity-0',
					!isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				)}>
				<div className={'flex flex-row items-center space-x-2'}>
					<button onClick={(): void => set_isSidebarOpen(!isSidebarOpen)} className={'hidden'}>
						<svg
							className={'h-5 w-5 text-neutral-500 transition-colors hover:text-neutral-900'}
							onClick={(): void => set_isSidebarOpen(!isSidebarOpen)}
							fill={'none'}
							viewBox={'0 0 24 24'}
							stroke={'currentColor'}>
							<path
								strokeLinecap={'round'}
								strokeLinejoin={'round'}
								strokeWidth={2}
								d={'M4 6h16M4 12h16M4 18h16'} />
						</svg>
					</button>
					<Link href={'/'}>
						<div className={'flex flex-row items-center space-x-4 p-2'}>
							<div className={'rounded-full border border-neutral-200 bg-neutral-0 p-2'}>
								<Logo className={'h-4 text-neutral-900'} />
							</div>
							<p className={'hidden font-semibold md:block'}>{'smol'}</p>
						</div>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<>
			{renderNoNavView()}
			<div
				className={cl(
					'fixed inset-y-0 left-0 z-50 h-full w-52 flex-col border-r border-r-neutral-200 bg-neutral-50 pt-1 px-2 transition-transform hidden',
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				)}>
				<div className={'flex flex-row items-center justify-between'}>
					<Link href={'/'}>
						<div className={'flex flex-row items-center space-x-4 p-2'}>
							<div className={'rounded-full border border-neutral-200 bg-neutral-0 p-2'}>
								<Logo className={'h-4 text-neutral-900'} />
							</div>
							<p className={'font-semibold'}>{'smol'}</p>
						</div>
					</Link>
					<button onClick={(): void => set_isSidebarOpen(!isSidebarOpen)}>
						<IconChevronBottom className={'h-4 w-4 rotate-90 text-neutral-400/80 transition-colors hover:text-neutral-900'} />
					</button>
				</div>

				<div className={'mb-6 mt-[-2px] h-[1px] w-full bg-neutral-200'} />

				<Link href={'/migratooor'}>
					<div className={'box-0 group flex cursor-pointer flex-col gap-4 p-4 transition-shadow hover:shadow'}>
						<div className={'relative flex flex-col gap-2'}>
							<IconLinkOut className={'absolute right-0 top-1 h-4 w-4 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
							<p className={'font-semibold text-neutral-700'}>{'Migrate'}</p>
							<p className={'text-xs text-neutral-500'}>{'The easiest way to migrate your tokens from one wallet to another.'}</p>
						</div>
					</div>
				</Link>

				<Link href={'/disperse'}>
					<div className={'box-0 group mt-2 flex cursor-pointer flex-col gap-4 p-4 transition-shadow hover:shadow'}>
						<div className={'relative flex flex-col gap-2'}>
							<IconLinkOut className={'absolute right-0 top-1 h-4 w-4 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
							<p className={'font-semibold text-neutral-700'}>{'Disperse'}</p>
							<p className={'text-xs text-neutral-500'}>{'Distribute ether or tokens to multiple addresses.'}</p>
						</div>
					</div>
				</Link>

				<Link href={'/safe'}>
					<div className={'box-0 group mt-2 flex cursor-pointer flex-col gap-4 p-4 transition-shadow hover:shadow'}>
						<div className={'relative flex flex-col gap-2'}>
							<IconLinkOut className={'absolute right-0 top-1 h-4 w-4 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
							<p className={'font-semibold text-neutral-700'}>{'MultiSafe'}</p>
							<p className={'text-xs text-neutral-500'}>{'Create a Safe, same address, every chain. Fancy.'}</p>
						</div>
					</div>
				</Link>

				<div className={'my-6 h-[1px] w-full bg-neutral-200'} />

				<Link href={'https://dump.services'} target={'_blank'}>
					<div className={'group relative mt-0 flex flex-row items-center justify-between gap-2 px-2'}>
						<p className={'text-sm text-neutral-700'}>{'Dump Services'}</p>
						<IconLinkOut className={'h-3 w-3 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
					</div>
				</Link>
				<Link href={'https://gib.to'} target={'_blank'}>
					<div className={'group relative mt-2 flex flex-row items-center justify-between gap-2 px-2'}>
						<p className={'text-sm text-neutral-700'}>{'Gib'}</p>
						<IconLinkOut className={'h-3 w-3 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
					</div>
				</Link>
				<Link href={'/nftmigratooor'}>
					<div className={'group relative mt-2 flex flex-row items-center justify-between gap-2 px-2'}>
						<p className={'text-sm text-neutral-700'}>{'NFT Migratooor'}</p>
						<IconLinkOut className={'h-3 w-3 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
					</div>
				</Link>
				<Link href={'/tokenlistooor'}>
					<div className={'group relative mt-2 flex flex-row items-center justify-between gap-2 px-2'}>
						<p className={'text-sm text-neutral-700'}>{'TokenListooor'}</p>
						<IconLinkOut className={'h-3 w-3 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
					</div>
				</Link>
			</div>
		</>
	);
}

function Header(): ReactElement {
	return (
		<div id={'head'} className={'fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-100 bg-neutral-0/95'}>
			<div id={'head'} className={'bg-[#1d4ed803] pl-52 pr-10'}>
				<div className={'mx-auto p-4'}>
					<div className={'flex items-center justify-end'}>
						<NetworkSelector networks={[]} />
						<WalletSelector />
					</div>
				</div>
			</div>
		</div>
	);
}

function	AppWrapper(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<Meta />
			<Header />
			<div className={'relative mx-auto mb-0 flex min-h-screen w-full flex-row pt-0'}>
				<SideBar />
				<AnimatePresence mode={'wait'}>
					<motion.div
						key={router.pathname}
						initial={'initial'}
						animate={'enter'}
						exit={'exit'}
						className={'w-full justify-center pt-6'}
						variants={thumbnailVariants}>
						<Component
							key={router.route}
							router={props.router}
							{...pageProps} />
					</motion.div>
				</AnimatePresence>
			</div>
		</React.Fragment>
	);
}

export default AppWrapper;
