import React from 'react';
import CardWithIcon from 'components/CardWithIcon';
import {useSelected} from 'contexts/useSelected';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useInjectedWallet} from '@yearn-finance/web-lib/hooks/useInjectedWallet';
import IconWalletWalletConnect from '@yearn-finance/web-lib/icons/IconWalletWalletConnect';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';

function	ViewWallet(): ReactElement {
	const	{onConnect} = useWeb3();
	const	detectedWalletProvider = useInjectedWallet();
	const	{walletProvider, set_walletProvider} = useSelected();

	return (
		<div className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
			<div className={'col-span-12 flex flex-col p-6 text-neutral-900'}>
				<div className={'w-3/4'}>
					<b>{'Connect your Wallet'}</b>
					<p className={'text-sm text-neutral-500'}>
						{'Connect your wallet to start using the Migratooor. Once connected, you will be able to select a destination and migrate your tokens.'}
					</p>
				</div>
				<div className={'col-span-12 mt-6 grid grid-cols-12 gap-6'}>
					<div className={'relative col-span-3'}>
						<CardWithIcon
							isSelected={walletProvider === 'INJECTED'}
							icon={detectedWalletProvider.icon}
							label={detectedWalletProvider.name}
							onClick={(): void => {
								performBatchedUpdates((): void => {
									set_walletProvider('INJECTED');
									onConnect('INJECTED', (e): void => console.error(e), (): void => undefined);
								});
							}} />
					</div>
					<div className={'relative col-span-3'}>
						<CardWithIcon
							isSelected={walletProvider === 'WALLET_CONNECT'}
							icon={<IconWalletWalletConnect />}
							label={'WalletConnect'}
							onClick={(): void => {
								performBatchedUpdates((): void => {
									set_walletProvider('WALLET_CONNECT');
									onConnect('WALLET_CONNECT', (e): void => console.error(e), (): void => undefined);
								});
							}} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default ViewWallet;
