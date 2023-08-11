import React from 'react';
import {Inter} from 'next/font/google';
import AppWrapper from 'components/common/AppWrapper';
import {MenuContextApp} from 'contexts/useMenu';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {SafeProvider} from '@gnosis.pm/safe-apps-react-sdk';
import {useLocalStorageValue} from '@react-hookz/web';
import {Analytics} from '@vercel/analytics/react';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';
import {FeebackPopover} from '@common/FeebackPopover';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import	'../style.css';

const inter = Inter({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

function	MyApp(props: AppProps): ReactElement {
	const {value: shouldHidePopover} = useLocalStorageValue<boolean>('smoldapp/feedback-popover');

	return (
		<>
			<style jsx global>{`html {font-family: ${inter.style.fontFamily};}`}</style>
			<WithYearn supportedChains={[...SUPPORTED_CHAINS, localhost]}>
				<TokenListContextApp>
					<WalletContextApp>
						<MenuContextApp>
							<SafeProvider>
								<main
									id={'app'}
									className={`flex flex-col ${inter.variable}`}>
									<AppWrapper {...props} />
								</main>
								{!shouldHidePopover && <FeebackPopover />}
							</SafeProvider>
						</MenuContextApp>
					</WalletContextApp>
				</TokenListContextApp>
			</WithYearn>
			<Analytics />
		</>
	);
}

export default MyApp;
