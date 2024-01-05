import {Fragment} from 'react';
import {Send} from 'components/sections/Send';
import {SendContextApp} from 'components/sections/Send/useSend';
import {BalancesCurtainContextApp} from 'contexts/useBalancesCurtain';

import type {ReactElement} from 'react';

export default function SendPage(): ReactElement {
	return (
		<SendContextApp>
			{({configuration: {inputs}}) => (
				<BalancesCurtainContextApp
					selectedTokenAddresses={inputs.map(input => input.token?.address).filter(Boolean)}>
					<Send />
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
