import {ProfileAddress, ProfileAvatar} from 'components/designSystem/Profile';
import {IconChevron} from '@icons/IconChevron';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

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
	const currentChain = getNetwork(1).nativeCurrency;

	return (
		<section className={'p-4'}>
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
			<hr className={'mb-2 mt-4 text-neutral-50'} />
			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small className={'text-xxs'}>{'Chain'}</small>
					<div
						className={cl(
							'flex w-full items-center justify-between rounded-lg bg-neutral-50 p-2',
							'text-xs'
						)}>
						{currentChain.name || 'Ethereum'}
						<IconChevron className={'h-4 w-4 rotate-90 text-neutral-900'} />
					</div>
				</div>
				<div>
					<small className={'text-xxs'}>{currentChain.symbol || 'ETH'}</small>
					<strong className={'text-base leading-8'}>{'3.692345'}</strong>
				</div>
			</div>
		</section>
	);
}

export default function Component(): ReactElement {
	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<div className={'flex h-fit w-full max-w-6xl flex-wrap items-center justify-center gap-4'}>
				<div>
					<small className={'pb-1'}>{'Loading'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
						<NavProfile
							isLoadingAvatar
							isConnecting
						/>
					</div>
				</div>

				<div>
					<small className={'pb-1'}>{'Loading avatar, no ens'}</small>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
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
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
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
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
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
