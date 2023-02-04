'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import Logo from 'components/icons/logo';
import Drawer from 'components/SettingsDrawer';
import {useMenu} from 'contexts/useMenu';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import IconSettings from '@yearn-finance/web-lib/icons/IconSettings';
import Header from '@yearn-finance/web-lib/layouts/Header.next';

import type {ReactElement} from 'react';

function	AppHeader(): ReactElement {
	const	{walletType} = useWeb3();
	const	pathname = usePathname();
	const	{onOpenMenu} = useMenu();
	const	[isDrawerOpen, set_isDrawerOpen] = useState(false);

	return (
		<div id={'head'} className={'bg-neutral-0/95 fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-100'}>
			<div className={'mx-auto max-w-4xl'}>
				<Header
					linkComponent={<Link href={''} />}
					currentPathName={pathname || ''}
					onOpenMenuMobile={onOpenMenu}
					nav={[{path: '/', label: <Logo className={'h-8 text-neutral-900'} />}]}
					supportedNetworks={walletType === 'EMBED_LEDGER' ? [1] : [1, 10, 250, 42161]}
					logo={(<div />)}
					extra={(
						<div className={'ml-4 flex'}>
							<button
								onClick={(): void => set_isDrawerOpen(true)}
								className={'text-neutral-600 transition-colors hover:text-neutral-900'}>
								<IconSettings className={'h-4'} />
							</button>
						</div>
					)} />
				<Drawer isDrawerOpen={isDrawerOpen} set_isDrawerOpen={set_isDrawerOpen} />
			</div>
		</div>
	);
}

export default AppHeader;
