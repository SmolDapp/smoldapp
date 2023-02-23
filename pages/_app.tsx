import React from 'react';
import AppWrapper from 'components/common/AppWrapper';
import {MenuContextApp} from 'contexts/useMenu';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {SafeProvider} from '@gnosis.pm/safe-apps-react-sdk';
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
		<>
			<style jsx global>{`html {font-family: ${inter.style.fontFamily};}`}</style>
			<WithYearn
				options={{
					web3: {
						supportedChainID: [1, 10, 137, 250, 42161, 1337]
					}
				}}>
				<TokenListContextApp>
					<WalletContextApp>
						<MenuContextApp>
							<SafeProvider>
								<main className={`flex h-screen flex-col ${inter.variable}`}>
									<AppWrapper {...props} />
								</main>
							</SafeProvider>
						</MenuContextApp>
					</WalletContextApp>
				</TokenListContextApp>
			</WithYearn>
		</>
	);
}

export default MyApp;
