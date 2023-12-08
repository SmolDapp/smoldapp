import {type ReactElement, useMemo, useState} from 'react';
import Image from 'next/image';
import {useAccount, useEnsAvatar} from 'wagmi';
import {IconChevron} from '@icons/IconChevron';
import {useIsMounted, useUpdateEffect} from '@react-hookz/web';
import {safeAddress} from '@utils/tools.address';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {TAddress} from '@yearn-finance/web-lib/types';

export function ProfileAvatar(props: {src: string | null | undefined; isLoading: boolean}): ReactElement {
	const [imageSrc, set_imageSrc] = useState(props.src);
	const hasAvatar = useMemo(() => imageSrc !== undefined, [imageSrc]);

	useUpdateEffect((): void => {
		set_imageSrc(props.src);
	}, [props.src]);

	if (props.isLoading) {
		return <div className={'h-10 w-10 min-w-[40px] animate-pulse rounded-full bg-neutral-300'} />;
	}
	if (!hasAvatar) {
		return <div className={'h-10 w-10 min-w-[40px] rounded-full bg-neutral-200'} />;
	}
	return (
		<div className={'h-10 w-10 min-w-[40px] rounded-full bg-neutral-100'}>
			<Image
				className={'animate-fadeIn rounded-full'}
				unoptimized
				src={imageSrc || ''}
				width={40}
				height={40}
				alt={''}
				onError={() => set_imageSrc(undefined)}
			/>
		</div>
	);
}

export function ProfileAddress(props: {
	address: TAddress | undefined;
	ens: string | undefined;
	isConnecting: boolean;
}): ReactElement {
	const isMounted = useIsMounted();

	if (!isMounted() || props.isConnecting) {
		return (
			<div className={'grid w-full gap-2'}>
				<div className={'h-4 w-full animate-pulse rounded-lg bg-neutral-300'} />
				<div className={'h-4 w-2/3 animate-pulse rounded-lg bg-neutral-300'} />
			</div>
		);
	}

	return (
		<div className={'grid w-full gap-2'}>
			<b className={'text-base leading-4'}>{safeAddress({address: props.address, ens: props.ens})}</b>
			<p className={'text-xs text-neutral-400'}>{safeAddress({address: props.address})}</p>
		</div>
	);
}

export function Profile(): ReactElement {
	const {address, ens} = useWeb3();
	const {isConnecting, isReconnecting} = useAccount();
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({chainId: 1, name: ens});

	return (
		<div className={'flex gap-2'}>
			<ProfileAvatar
				isLoading={isLoadingAvatar || isConnecting || isReconnecting}
				src={avatar}
			/>
			<ProfileAddress
				isConnecting={isConnecting || isReconnecting}
				address={address}
				ens={ens}
			/>
		</div>
	);
}

export function NavProfile(): ReactElement {
	const {chainID} = useChainID();
	const currentChain = getNetwork(chainID || 1).nativeCurrency;

	return (
		<section className={'p-4'}>
			<Profile />

			<hr className={'mb-2 mt-4 text-neutral-50'} />

			<div className={'grid grid-cols-2 gap-6'}>
				<div>
					<small className={'text-xxs'}>{'Chain'}</small>
					<div
						suppressHydrationWarning //todo: correctly handle hydration
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
