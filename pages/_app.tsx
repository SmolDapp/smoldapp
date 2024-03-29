import React from 'react';
import {Rubik, Source_Code_Pro} from 'next/font/google';
import PlausibleProvider from 'next-plausible';
import Layout from 'components/designSystem/Layout';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {localhost} from '@builtbymom/web3/utils/wagmi';
import {SafeProvider} from '@gnosis.pm/safe-apps-react-sdk';
import {useLocalStorageValue} from '@react-hookz/web';
import {supportedNetworks, supportedTestNetworks} from '@utils/tools.chains';
import {Analytics} from '@vercel/analytics/react';
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
			<WithMom
				supportedChains={[...supportedNetworks, ...supportedTestNetworks, localhost]}
				tokenLists={['https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/tokenlistooor.json']}>
				<WalletContextApp>
					<SafeProvider>
						<PlausibleProvider
							// TODO: update all
							domain={'test-localhost'}
							enabled={true}
							trackLocalhost={true}>
							<main className={`flex h-app flex-col ${rubik.variable} ${sourceCodePro.variable}`}>
								<Meta />
								<Layout {...props} />
							</main>
							{!shouldHidePopover && <FeebackPopover />}
						</PlausibleProvider>
					</SafeProvider>
				</WalletContextApp>
			</WithMom>
			<Analytics />
		</>
	);
}

export default MyApp;
