import {useState} from 'react';
import {useAddressBook} from 'contexts/useAddressBook';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {getIsSmartContract, isNullAddress} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {Warning} from '@common/Primitives/Warning';

import {useSend} from './useSend';

import type {ReactElement} from 'react';

export function SendWarning({isReceiverERC20}: {isReceiverERC20: boolean}): ReactElement | null {
	const {configuration} = useSend();
	const {safeChainID} = useChainID();

	const [warningMessage, set_warningMessage] = useState<string | null>(null);

	const {getEntry} = useAddressBook();

	useAsyncTrigger(async (): Promise<void> => {
		const isSmartContract =
			!!configuration.receiver.address &&
			(await getIsSmartContract({
				address: configuration.receiver.address,
				chainId: safeChainID
			}));

		const fromAddressBook = await getEntry({address: configuration.receiver.address});

		if (isSmartContract && !fromAddressBook && !isReceiverERC20) {
			return set_warningMessage(
				'You are going to send tokens to smart contract that is not present in the Address Book'
			);
		}

		if (isNullAddress(configuration.receiver.address)) {
			return set_warningMessage('Impossible to sent tokens to null address');
		}

		if (isReceiverERC20) {
			return set_warningMessage('Receiver is an ERC20 token');
		}

		if (configuration.receiver.address && !fromAddressBook) {
			return set_warningMessage('Address is not present in the Address Book');
		}

		if (configuration.receiver.address && !fromAddressBook?.chains.includes(safeChainID)) {
			return set_warningMessage('Address in the Address Book is related to different chain');
		}

		return set_warningMessage(null);
	}, [configuration.receiver.address, getEntry, isReceiverERC20, safeChainID]);

	if (!warningMessage) {
		return null;
	}

	return (
		<div className={'mb-4'}>
			<Warning message={warningMessage} />
		</div>
	);
}
