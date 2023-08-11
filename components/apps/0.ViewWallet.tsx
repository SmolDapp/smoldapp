import React, {Fragment, useCallback, useMemo} from 'react';
import CardWithIcon from 'components/common/CardWithIcon';
import {useWallet} from 'contexts/useWallet';
import {useIsMounted} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useInjectedWallet} from '@yearn-finance/web-lib/hooks/useInjectedWallet';
import IconWalletLedger from '@yearn-finance/web-lib/icons/IconWalletLedger';
import IconWalletSafe from '@yearn-finance/web-lib/icons/IconWalletSafe';
import IconWalletWalletConnect from '@yearn-finance/web-lib/icons/IconWalletWalletConnect';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {ReactElement} from 'react';

type TViewWalletProps = {
	onSelect: () => void;
};

function SectionWalletSelection({onSelect}: TViewWalletProps): ReactElement {
	const {onConnect, walletType} = useWeb3();
	const detectedWalletProvider = useInjectedWallet();
	const {walletProvider, set_walletProvider} = useWallet();

	const onSelectWallet = useCallback(async (walletType: string): Promise<void> => {
		try {
			set_walletProvider(walletType);
			onSelect();
			await onConnect(walletType, (): void => set_walletProvider('NONE'), (): void => undefined);
		} catch {
			//
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onConnect]);

	const detectedWallet = useMemo((): {name: string, icon: ReactElement} => {
		if (walletType === 'EMBED_LEDGER') {
			return ({
				name: 'Ledger',
				icon: <IconWalletLedger />
			});
		}
		if (walletType === 'EMBED_GNOSIS_SAFE') {
			return ({
				name: 'Safe',
				icon: <IconWalletSafe />
			});
		}
		return ({
			name: detectedWalletProvider.name,
			icon: detectedWalletProvider.icon
		});
	}, [detectedWalletProvider, walletType]);

	const isMounted = useIsMounted();
	if (!isMounted()) {
		return <Fragment />;
	}

	return (
		<Fragment>
			<div className={'relative col-span-6 md:col-span-4'}>
				<CardWithIcon
					isSelected={walletProvider === 'INJECTED' || walletType === 'INJECTED' || ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType)}
					icon={detectedWallet.icon}
					label={detectedWallet.name}
					onClick={async (): Promise<void> => ['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType) ? undefined : onSelectWallet('INJECTED')} />
			</div>
			<div className={`relative col-span-6 md:col-span-4 ${['EMBED_LEDGER', 'EMBED_GNOSIS_SAFE'].includes(walletType) ? 'hidden' : 'flex'}`}>
				<CardWithIcon
					isSelected={walletProvider === 'WALLET_CONNECT' || walletType === 'WALLET_CONNECT'}
					icon={<IconWalletWalletConnect />}
					label={'WalletConnect'}
					onClick={async (): Promise<void> => onSelectWallet('WALLET_CONNECT')} />
			</div>
		</Fragment>
	);
}

function ViewWallet({onSelect}: TViewWalletProps): ReactElement {
	return (
		<section id={'wallet'} className={'pt-10'}>
			<div className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
				<ViewSectionHeading
					title={'Connect your Wallet'}
					content={'Connect your wallet to start using this app.'} />
				<div className={'col-span-12 grid grid-cols-12 gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0'}>
					<SectionWalletSelection onSelect={onSelect} />
				</div>
			</div>
		</section>
	);
}

export default ViewWallet;
