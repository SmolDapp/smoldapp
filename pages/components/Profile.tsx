import {
	ConnectProfile,
	NavProfile,
	NetworkSelector,
	ProfileAddress,
	ProfileAvatar
} from 'components/designSystem/Profile';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TNavProfileDemoProps = {
	isLoadingAvatar: boolean;
	isConnecting: boolean;
	address?: TAddress;
	ens?: string;
	avatar?: string;
};
function NavProfileDemo(props: TNavProfileDemoProps): ReactElement {
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

			<hr className={'mb-2 mt-4 text-neutral-200'} />

			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small className={'text-xxs'}>{'Chain'}</small>
					<NetworkSelector />
				</div>
				<div>
					<small className={'text-xxs'}>{'Coin'}</small>
					{props.isConnecting ? (
						<div className={'skeleton-lg mt-1 h-6 w-2/3'} />
					) : (
						<strong className={'text-base leading-8'}>{'0.00000'}</strong>
					)}
				</div>
			</div>
		</section>
	);
}

export default function Component(): ReactElement {
	const {onConnect, onDesactivate} = useWeb3();
	return (
		<>
			<div className={'flex justify-center gap-4 pt-4 text-xxs'}>
				<button
					className={'text-xs'}
					onClick={onConnect}>
					{'Connect'}
				</button>
				{' | '}
				<button
					className={'text-xs'}
					onClick={onDesactivate}>
					{'Disconnect'}
				</button>
			</div>
			<div className={'mt-20 flex flex-col items-center justify-center gap-20'}>
				<div>
					<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
						<NavProfile />
					</div>
				</div>
				<div
					className={
						'mx-auto grid h-fit w-full max-w-6xl grid-cols-2 flex-wrap items-center justify-center gap-8 md:grid-cols-3'
					}>
					<div className={'flex w-full flex-col items-center'}>
						<small className={'pb-1'}>{'Not connected'}</small>
						<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
							<ConnectProfile />
						</div>
					</div>

					<div className={'flex w-full flex-col items-center'}>
						<small className={'pb-1'}>{'Loading'}</small>
						<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
							<NavProfileDemo
								isLoadingAvatar
								isConnecting
							/>
						</div>
					</div>

					<div className={'flex w-full flex-col items-center'}>
						<small className={'pb-1'}>{'Loading avatar, no ens'}</small>
						<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
							<NavProfileDemo
								isLoadingAvatar
								isConnecting={false}
								address={'0xe8fcbDf9dEaFaDd9e7C4B5859130805599e56864'}
								ens={undefined}
								avatar={undefined}
							/>
						</div>
					</div>

					<div className={'flex w-full flex-col items-center'}>
						<small className={'pb-1'}>{'Ens, no avatar'}</small>
						<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
							<NavProfileDemo
								isLoadingAvatar={false}
								isConnecting={false}
								address={'0xe8fcbDf9dEaFaDd9e7C4B5859130805599e56864'}
								ens={'Dad.eth'}
								avatar={undefined}
							/>
						</div>
					</div>

					<div className={'flex w-full flex-col items-center'}>
						<small className={'pb-1'}>{'Ens, avatar'}</small>
						<div className={'flex w-[280px] flex-col rounded-lg bg-neutral-0'}>
							<NavProfileDemo
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
		</>
	);
}
