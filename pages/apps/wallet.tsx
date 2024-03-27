import {Fragment} from 'react';
import {Wallet} from 'components/sections/Wallet';

import type {ReactElement} from 'react';

export default function WalletPage(): ReactElement {
	return <Wallet />;
}

WalletPage.AppName = 'Wallet';
WalletPage.AppDescription = 'If you want to see tokens form another chains - switch chain in the side bar.';
WalletPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};
