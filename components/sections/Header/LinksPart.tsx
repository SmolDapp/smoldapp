'use client';

import React from 'react';
import SocialMediaCard from 'components/common/SocialMediaCard';
import {LogoENS} from '@icons/LogoENS';
import LogoEtherscan from '@icons/LogoEtherscan';
import {LogoSafe} from '@icons/LogoSafe';
import {useIsMounted} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {ReactElement} from 'react';

export function LinksPart(): ReactElement {
	const {address, ens} = useWeb3();
	const isMounted = useIsMounted();

	return (
		<div
			className={'flex gap-4'}
			key={isMounted() ? 'client' : 'server'}>
			<SocialMediaCard
				href={`https://etherscan.io/address/${address}`}
				target={'_blank'}
				isDisabled={!address}
				tooltip={'View on Etherscan'}
				icon={<LogoEtherscan />}
			/>
			<SocialMediaCard
				href={`https://app.ens.domains/${ens || ''}`}
				target={'_blank'}
				isDisabled={!ens || ens === ''}
				tooltip={'Manage ENS profile'}
				icon={<LogoENS />}
			/>
			<div className={'relative'}>
				<SocialMediaCard
					href={'/safe'}
					isDisabled
					tooltip={'You are not using a Safe'}
					icon={<LogoSafe />}
				/>
				<div className={'absolute -right-0 -top-0 h-2 w-2'}>
					<span className={'absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/75'} />
					<span className={'absolute inline-flex h-2 w-2 rounded-full bg-orange-500'} />
				</div>
			</div>
		</div>
	);
}
