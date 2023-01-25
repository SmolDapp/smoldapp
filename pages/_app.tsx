import React from 'react';
import AppWrapper from 'components/common/AppWrapper';
import {MenuContextApp} from 'contexts/useMenu';
import {SelectedContextApp} from 'contexts/useSelected';
import {WalletContextApp} from 'contexts/useWallet';
import {Inter} from '@next/font/google';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import	'../style.css';

const inter = Inter({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

function	MyApp(props: AppProps): ReactElement {
	return (
		<WithYearn>
			<SelectedContextApp>
				<WalletContextApp>
					<MenuContextApp>
						<main className={`flex h-screen flex-col ${inter.variable}`}>
							<AppWrapper {...props} />
						</main>
					</MenuContextApp>
				</WalletContextApp>
			</SelectedContextApp>
		</WithYearn>
	);
}

export default MyApp;
