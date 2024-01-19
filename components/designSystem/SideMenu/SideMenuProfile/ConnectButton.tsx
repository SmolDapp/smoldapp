import {type ReactElement} from 'react';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {cl} from '@builtbymom/web3/utils';
import {IconWallet} from '@icons/IconWallet';

export function ConnectButton(): ReactElement {
	const {onConnect} = useWeb3();

	return (
		<section
			className={cl(
				'h-[145px] rounded-t-lg bg-neutral-0',
				'px-10 pb-6 pt-5',
				'flex flex-col justify-center items-center'
			)}>
			<div className={'mb-5 flex size-12 items-center justify-center rounded-full bg-neutral-300'}>
				<IconWallet className={'size-6 text-neutral-700'} />
			</div>
			<div className={'w-full'}>
				<button
					onClick={onConnect}
					className={'h-8 w-full rounded-lg bg-primary text-xs transition-colors hover:bg-primaryHover'}>
					{'Connect Wallet'}
				</button>
			</div>
		</section>
	);
}
