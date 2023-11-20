import React, {Fragment, memo} from 'react';
import {Inter} from 'next/font/google';
import {type NextRouter, useRouter} from 'next/router';
import SectionHeader from 'components/SectionHeader';
import {MenuContextApp} from 'contexts/useMenu';
import {TokenListContextApp} from 'contexts/useTokenList';
import {WalletContextApp} from 'contexts/useWallet';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {SafeProvider} from '@gnosis.pm/safe-apps-react-sdk';
import {useLocalStorageValue} from '@react-hookz/web';
import {Analytics} from '@vercel/analytics/react';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';
import {localhost} from '@yearn-finance/web-lib/utils/wagmi/networks';
import AppWrapper from '@common/AppWrapper';
import {FeebackPopover} from '@common/FeebackPopover';

import type {NextComponentType} from 'next';
import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const inter = Inter({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

type TGetLayout = NextComponentType & {
	getLayout: (p: ReactElement, router: NextRouter) => ReactElement;
};
const WithLayout = memo(function WithLayout(props: AppProps): ReactElement {
	const router = useRouter();
	const {Component} = props;
	const getLayout = (Component as TGetLayout).getLayout || ((page: ReactElement): ReactElement => page);

	return (
		<Fragment>
			<SectionHeader />
			{getLayout(<AppWrapper {...props} />, router)}
		</Fragment>
	);
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
						font-family: ${inter.style.fontFamily};
					}
				`}
			</style>
			<WithYearn supportedChains={[...SUPPORTED_CHAINS, localhost]}>
				<TokenListContextApp>
					<WalletContextApp>
						<MenuContextApp>
							<SafeProvider>
								<main
									id={'app'}
									className={`flex flex-col ${inter.variable}`}>
									<WithLayout {...props} />
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
