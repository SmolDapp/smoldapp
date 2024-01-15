import {Fragment} from 'react';
import {Send} from 'components/sections/Send';
import {SendContextApp} from 'components/sections/Send/useSendFlow';
import {BalancesCurtainContextApp} from 'contexts/useBalancesCurtain';

import type {ParsedUrlQuery} from 'querystring';
import type {ReactElement} from 'react';

export default function SendPage({pageProps}: {pageProps: {query: ParsedUrlQuery}}): ReactElement {
	return (
		<SendContextApp>
			{({configuration: {inputs}}) => (
				<BalancesCurtainContextApp
					selectedTokenAddresses={inputs.map(input => input.token?.address).filter(Boolean)}>
					<Send queryParams={pageProps.query} />
				</BalancesCurtainContextApp>
			)}
		</SendContextApp>
	);
}

SendPage.AppName = 'Send';
SendPage.AppDescription = 'Deliver any of your tokens anywhere';
SendPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};
// SendPage.getInitialProps = (context: NextPageContext): {query: ParsedUrlQuery} => {
// 	return {
// 		query: context.query
// 	};
// };
