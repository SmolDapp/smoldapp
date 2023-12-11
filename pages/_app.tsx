import React from 'react';
import {Rubik, Source_Code_Pro} from 'next/font/google';
import Layout from 'components/designSystem/Layout';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {SafeProvider} from '@gnosis.pm/safe-apps-react-sdk';
import {useLocalStorageValue} from '@react-hookz/web';
import {supportedNetworks, supportedTestNetworks} from '@utils/tools.chains';
import {Analytics} from '@vercel/analytics/react';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';
import {FeebackPopover} from '@common/FeebackPopover';
import Meta from '@common/Meta';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const rubik = Rubik({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--rubik-font'
});

const sourceCodePro = Source_Code_Pro({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--scp-font'
});

function MyApp(props: AppProps): ReactElement {
	const {value: shouldHidePopover} = useLocalStorageValue<boolean>('smoldapp/feedback-popover');

	return (
		<>
			<style
				jsx
				global>
				{`
					html {
						font-family: ${rubik.style.fontFamily}, ${sourceCodePro.style.fontFamily};
					}
				`}
			</style>
			<WithYearn supportedChains={[...supportedNetworks, ...supportedTestNetworks, localhost]}>
				<TokenListContextApp>
					<WalletContextApp>
						<SafeProvider>
							<main className={`flex h-app flex-col ${rubik.variable} ${sourceCodePro.variable}`}>
								<Meta />
								<Layout {...props} />
							</main>
							{!shouldHidePopover && <FeebackPopover />}
						</SafeProvider>
					</WalletContextApp>
				</TokenListContextApp>
			</WithYearn>
			<Analytics />
		</>
	);
}

export default MyApp;
