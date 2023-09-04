import React, {Fragment} from 'react';
import CardWithIcon from 'components/common/CardWithIcon';
import {useIsMounted} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {IconWalletWalletConnect} from '@yearn-finance/web-lib/icons/IconWalletWalletConnect';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {ReactElement} from 'react';

type TViewWalletProps = {
	onSelect: () => void;
};

function SectionWalletSelection({onSelect}: TViewWalletProps): ReactElement {
	const {isActive, onConnect} = useWeb3();

	const isMounted = useIsMounted();
	if (!isMounted()) {
		return <Fragment />;
	}

	return (
		<Fragment>
			<div className={`relative col-span-6 md:col-span-4 flex`}>
				<CardWithIcon
					isSelected={isActive}
					icon={<IconWalletWalletConnect />}
					label={'WalletConnect'}
					onClick={async (): Promise<void> => {
						await onConnect()
						onSelect();
					}} />
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
