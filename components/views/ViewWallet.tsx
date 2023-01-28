import React from 'react';
import {useRouter} from 'next/router';
import CardWithIcon from 'components/CardWithIcon';
import {useSelected} from 'contexts/useSelected';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useInjectedWallet} from '@yearn-finance/web-lib/hooks/useInjectedWallet';
import IconWalletWalletConnect from '@yearn-finance/web-lib/icons/IconWalletWalletConnect';

import type {ReactElement} from 'react';

function	ViewWallet(): ReactElement {
	const	{onConnect} = useWeb3();
	const	detectedWalletProvider = useInjectedWallet();
	const	{walletProvider, set_walletProvider} = useSelected();
	const	router = useRouter();

	return (
		<section id={'wallet'}>
			<div className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<a href={'#wallet'}>
							<b>{'Connect your Wallet'}</b>
						</a>
						<p className={'text-sm text-neutral-500'}>
							{'Connect your wallet to start using the Migratooor. Once connected, you will be able to select a destination and migrate your tokens.'}
						</p>
					</div>
					<div className={'col-span-12 mt-6 grid grid-cols-12 gap-4 md:gap-6'}>
						<div className={'relative col-span-6 md:col-span-3'}>
							<CardWithIcon
								isSelected={walletProvider === 'INJECTED'}
								icon={detectedWalletProvider.icon}
								label={detectedWalletProvider.name}
								onClick={async (): Promise<void> => {
									set_walletProvider('INJECTED');
									try {
										router.replace('#destination', '#destination', {shallow: true, scroll: false});
									} catch {
										//
									}
									await onConnect('INJECTED', (e): void => console.error(e), (): void => undefined);
								}} />
						</div>
						<div className={'relative col-span-6 md:col-span-3'}>
							<CardWithIcon
								isSelected={walletProvider === 'WALLET_CONNECT'}
								icon={<IconWalletWalletConnect />}
								label={'WalletConnect'}
								onClick={async (): Promise<void> => {
									set_walletProvider('WALLET_CONNECT');
									try {
										router.replace('#destination', '#destination', {shallow: true, scroll: false});
									} catch {
										//
									}
									await onConnect('WALLET_CONNECT', (e): void => console.error(e), (): void => undefined);
								}} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewWallet;
