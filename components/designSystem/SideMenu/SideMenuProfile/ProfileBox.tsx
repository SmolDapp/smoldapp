import {type ReactElement} from 'react';
import {AddressBookEntryAddress} from 'components/designSystem/AddressBookEntry';
import {Avatar} from 'components/designSystem/Avatar';
import {useAccount, useEnsAvatar} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';

export function ProfileBox(): ReactElement {
	const {address, ens} = useWeb3();
	const {isConnecting} = useAccount();
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({chainId: 1, name: ens});

	return (
		<div className={'flex gap-2'}>
			<Avatar
				sizeClassname={'h-10 w-10 min-w-[40px]'}
				isLoading={isLoadingAvatar || isConnecting}
				label={ens || undefined}
				address={address}
				src={avatar}
			/>
			<AddressBookEntryAddress
				shouldTruncateAddress
				isConnecting={isConnecting}
				address={address}
				ens={ens}
			/>
		</div>
	);
}
