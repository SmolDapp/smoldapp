import {useState} from 'react';
import Link from 'next/link';
import {useAddressBook} from 'contexts/useAddressBook';
import {useAddressBookCurtain} from 'contexts/useAddressBookCurtain';
import {useAsyncTrigger} from '@builtbymom/web3/hooks/useAsyncTrigger';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {isEthAddress} from '@builtbymom/web3/utils';
import {getIsSmartContract} from '@utils/tools.address';
import {supportedNetworks} from '@utils/tools.chains';
import {Warning} from '@common/Primitives/Warning';

import {useSendFlow} from './useSendFlow';

import type {ReactElement, ReactNode} from 'react';
import type {TWarningType} from '@common/Primitives/Warning';

function TriggerAddressBookButton({children}: {children: ReactNode}): ReactElement {
	const {set_curtainStatus, dispatchConfiguration} = useAddressBookCurtain();
	const {configuration} = useSendFlow();

	return (
		<button
			className={'font-bold transition-all'}
			onClick={() => {
				set_curtainStatus({isOpen: true, isEditing: true});
				dispatchConfiguration({
					type: 'SET_SELECTED_ENTRY',
					payload: {
						address: configuration.receiver.address,
						label: '',
						slugifiedLabel: '',
						chains: [],
						isFavorite: false
					}
				});
			}}>
			{children}
		</button>
	);
}

export function SendStatus({isReceiverERC20}: {isReceiverERC20: boolean}): ReactElement | null {
	const {configuration} = useSendFlow();
	const {safeChainID} = useChainID();

	const [status, set_status] = useState<{type: TWarningType; message: string | ReactElement} | null>(null);

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
				message: (
					<>
						{'Hello. Looks like you’re sending to a '}
						<Link
							target={'_blank'}
							// TODO: add link
							href={'/'}>
							<span className={'font-semibold hover:underline'}>{'smart contract address'}</span>
						</Link>
						{'. If it’s intentional, go right ahead, otherwise you might want to double check.'}
					</>
				),
				type: 'warning'
			});
		}

		if (isEthAddress(configuration.receiver.address)) {
			return set_status({
				message: 'Yo… uh… hmm… this is an invalid address. Tokens sent here may be lost forever. Oh no!',
				type: 'error'
			});
		}

		if (isReceiverERC20) {
			return set_status({
				message: 'You’re sending to an ERC20 token address. Tokens sent here may be lost forever. Rip!',
				type: 'error'
			});
		}

		if (
			configuration.receiver.address &&
			(!fromAddressBook || (fromAddressBook?.numberOfInteractions === 0 && fromAddressBook.isHidden))
		) {
			return set_status({
				message: (
					<>
						{'This is the first time you interact with this address, please be careful.'}
						<TriggerAddressBookButton>{'Wanna add it to Address Book?'}</TriggerAddressBookButton>
					</>
				),
				type: 'warning'
			});
		}

		if (configuration.receiver.address && fromAddressBook?.isHidden) {
			return set_status({
				message: (
					<>
						{'This address isn’t in your address book.'}{' '}
						<TriggerAddressBookButton>{'Wanna add it?'}</TriggerAddressBookButton>
					</>
				),
				type: 'warning'
			});
		}

		if (configuration.receiver.address && !fromAddressBook?.chains.includes(safeChainID)) {
			const currentNetworkName = supportedNetworks.find(network => network.id === safeChainID)?.name;
			const fromAddressBookNetworkNames = fromAddressBook?.chains
				.map(chain => supportedNetworks.find(network => network.id === chain)?.name)
				.join(', ');

			return set_status({
				message: `You added this address on ${fromAddressBookNetworkNames}, please check it can receive funds on ${currentNetworkName}.`,
				type: 'warning'
			});
		}

		return set_status(null);
	}, [configuration.receiver.address, getEntry, isReceiverERC20, safeChainID]);

	if (!status) {
		return null;
	}

	return (
		<div className={'mb-4'}>
			<Warning
				message={status.message}
				type={status.type}
			/>
		</div>
	);
}
