import {useState} from 'react';
import {useAddressBook} from 'contexts/useAddressBook';
import {useAsyncTrigger} from '@builtbymom/web3/hooks/useAsyncTrigger';
import {isEthAddress} from '@builtbymom/web3/utils';
import {getIsSmartContract} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {Warning} from '@common/Primitives/Warning';

import {useSendFlow} from './useSendFlow';

import type {ReactElement} from 'react';
import type {TWarningType} from '@common/Primitives/Warning';

export function SendStatus({isReceiverERC20}: {isReceiverERC20: boolean}): ReactElement | null {
	const {configuration} = useSendFlow();
	const {safeChainID} = useChainID();

	const [status, set_status] = useState<{type: TWarningType; message: string} | null>(null);

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
			return set_status({
				message: 'You are going to send tokens to smart contract that is not present in the Address Book',
				type: 'warning'
			});
		}

		if (isEthAddress(configuration.receiver.address)) {
			return set_status({message: 'Impossible to sent tokens to null address', type: 'error'});
		}

		if (isReceiverERC20) {
			return set_status({message: 'Receiver is an ERC20 token', type: 'error'});
		}

		if (configuration.receiver.address && !fromAddressBook) {
			return set_status({message: 'Address is not present in the Address Book', type: 'warning'});
		}

		if (configuration.receiver.address && !fromAddressBook?.chains.includes(safeChainID)) {
			return set_status({message: 'Address in the Address Book is related to different chain', type: 'warning'});
		}

		return set_status(null);
	}, [configuration.receiver.address, getEntry, isReceiverERC20, safeChainID]);

	if (!status) {
		return null;
	}

	return (
		<div className={'mb-4'}>
			<Warning
				message={status?.message}
				type={status.type}
			/>
		</div>
	);
}
