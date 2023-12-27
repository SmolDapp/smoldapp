import {useState} from 'react';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {getIsSmartContract} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {Warning} from '@common/Primitives/Warning';

import {useSend} from './useSend';

import type {ReactElement} from 'react';

export function SendWarning(): ReactElement | null {
	const {configuration} = useSend();
	const {safeChainID} = useChainID();

	const [warningMessage, set_warningMessage] = useState<string | null>(null);

	useAsyncTrigger(async (): Promise<void> => {
		const isSmartContract =
			configuration.receiver.address &&
			(await getIsSmartContract({
				address: configuration.receiver.address,
				chainId: safeChainID
			}));

		if (isSmartContract) {
			return set_warningMessage(
				'You are going to send tokens to smart contract that is not present in the Address Book'
			);
		}
		return set_warningMessage(null);
	}, [configuration.receiver.address, safeChainID]);

	if (!warningMessage) {
		return null;
	}

	return (
		<div className={'mb-4'}>
			<Warning message={warningMessage} />
		</div>
	);
}
