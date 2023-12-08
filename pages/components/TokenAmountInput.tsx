import {SmolTokenAmountInput} from 'components/designSystem/SmolTokenAmountInput';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';

export default function TokenAmountInput(): ReactElement {
	const tokens = [
		{
			address: toAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'),
			balance: {
				normalized: '0',
				raw: 0n
			},
			chainID: 1,
			decimals: 18,
			logoURI: 'https://assets.smold.app/api/token/1/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
			name: 'Dai Stablecoin',
			symbol: 'DAI'
		}
	];
	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<div className={'flex items-center justify-center rounded-lg bg-neutral-0 p-4'}>
				<SmolTokenAmountInput tokens={tokens} />
			</div>
		</div>
	);
}
