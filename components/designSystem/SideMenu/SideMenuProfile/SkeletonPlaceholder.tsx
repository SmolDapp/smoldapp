import {type ReactElement} from 'react';
import {AddressBookEntryAddress} from 'components/designSystem/AddressBookEntry';
import {Avatar} from 'components/designSystem/Avatar';
import {NetworkPopoverSelector} from 'components/designSystem/NetworkSelector/Popover';

export function SkeletonPlaceholder(): ReactElement {
	return (
		<section className={'p-4'}>
			<div className={'flex gap-2'}>
				<Avatar
					isLoading
					address={undefined}
					src={undefined}
				/>
				<AddressBookEntryAddress
					isConnecting
					address={undefined}
					ens={undefined}
				/>
			</div>

			<hr className={'mb-2 mt-4 text-neutral-200'} />

			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small className={'text-xxs'}>{'Chain'}</small>
					<NetworkPopoverSelector />
				</div>
				<div>
					<small className={'text-xxs'}>{'Coin'}</small>
					<div className={'skeleton-lg mt-1 h-6 w-2/3'} />
				</div>
			</div>
		</section>
	);
}
