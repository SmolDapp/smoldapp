import {ProfileAddress, ProfileAvatar} from 'components/designSystem/Profile';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TNavProfileDemoProps = {
	isLoadingAvatar: boolean;
	isConnecting: boolean;
	address?: TAddress;
	ens?: string;
	avatar?: string;
};
function NavProfile(props: TNavProfileDemoProps): ReactElement {
	return (
		<div className={'flex gap-2'}>
			<ProfileAvatar
				isLoading={props.isLoadingAvatar}
				src={props.avatar}
			/>
			<ProfileAddress
				isConnecting={props.isConnecting}
				address={props.address}
				ens={props.ens}
			/>
		</div>
	);
}

export default function Component(): ReactElement {
	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<div className={'flex h-fit w-full max-w-6xl flex-wrap items-center justify-center gap-4'}>
				<div>
					<small className={'pb-1'}>{'Loading'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0 p-4'}>
						<NavProfile
							isLoadingAvatar
							isConnecting
						/>
					</div>
				</div>

				<div>
					<small className={'pb-1'}>{'Loading avatar, no ens'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0 p-4'}>
						<NavProfile
							isLoadingAvatar
							isConnecting={false}
							address={'0xe8fcbDf9dEaFaDd9e7C4B5859130805599e56864'}
							ens={undefined}
							avatar={undefined}
						/>
					</div>
				</div>

				<div>
					<small className={'pb-1'}>{'Ens, no avatar'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0 p-4'}>
						<NavProfile
							isLoadingAvatar={false}
							isConnecting={false}
							address={'0xe8fcbDf9dEaFaDd9e7C4B5859130805599e56864'}
							ens={'Dad.eth'}
							avatar={undefined}
						/>
					</div>
				</div>

				<div>
					<small className={'pb-1'}>{'Ens, avatar'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0 p-4'}>
						<NavProfile
							isLoadingAvatar={false}
							isConnecting={false}
							address={'0xe8fcbDf9dEaFaDd9e7C4B5859130805599e56864'}
							ens={'Mom.eth'}
							avatar={'https://pbs.twimg.com/profile_images/1723330184240041984/09skVkUh_400x400.jpg'}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
