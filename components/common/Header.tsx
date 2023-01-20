import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import Logo from 'components/icons/logo';
import {useMenu} from 'contexts/useMenu';
import Header from '@yearn-finance/web-lib/layouts/Header.next';

import type {ReactElement} from 'react';

function	AppHeader(): ReactElement {
	const	{pathname} = useRouter();
	const	{onOpenMenu} = useMenu();

	return (
		<Header
			linkComponent={<Link href={''} />}
			currentPathName={pathname}
			onOpenMenuMobile={onOpenMenu}
			nav={[{path: '/', label: <Logo className={'h-8 text-neutral-900'} />}]}
			supportedNetworks={[1, 10, 250, 42161]}
			logo={(<div />)} />
	);
}

export default AppHeader;
