import {type ReactElement, useMemo} from 'react';
import {useAddressBook} from 'contexts/useAddressBook';
import {Warning} from '@common/Primitives/Warning';

import {useDisperse} from './useDisperse';

import type {TWarningType} from '@common/Primitives/Warning';

export function DisperseStatus(): ReactElement | null {
	const {configuration} = useDisperse();
	const {getCachedEntry} = useAddressBook();

	const addresses = configuration.inputs.map(input => input.receiver.address).filter(Boolean);

	const status: {type: TWarningType; message: string | ReactElement} | null = useMemo(() => {
		if (addresses.some(address => !getCachedEntry({address}))) {
			return {
				message:
					"It's the first time you are sending tokens to some addresses on this lists. Make sure that's what you want to do",
				type: 'warning'
			};
		}
		return null;
	}, [addresses, getCachedEntry]);

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
