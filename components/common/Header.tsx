import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import Logo from 'components/icons/logo';
import Header from '@yearn-finance/web-lib/components/Header';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {ReactElement} from 'react';

function	AppHeader(): ReactElement {
	const	{walletType} = useWeb3();
	const	{pathname} = useRouter();

	return (
		<div id={'head'} className={'fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-100 bg-neutral-0/95'}>
			<div className={'mx-auto max-w-4xl'}>
				<Header
					linkComponent={<Link href={''} />}
					currentPathName={pathname || ''}
					onOpenMenuMobile={(): void => undefined}
					nav={[{path: '/', label: <Logo className={'h-8 text-neutral-900'} />}]}
					supportedNetworks={walletType === 'EMBED_LEDGER' ? [1] : []}
					logo={(<div />)} />
			</div>
		</div>
	);
}

export default AppHeader;
