import {type ReactElement} from 'react';
import {IconWallet} from '@icons/IconWallet';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {cl} from '@yearn-finance/web-lib/utils/cl';

export function ConnectButton(): ReactElement {
	const {onConnect} = useWeb3();

	return (
		<section
			className={cl(
				'h-[145px] rounded-t-lg bg-neutral-0',
				'px-10 pb-6 pt-5',
				'flex flex-col justify-center items-center'
			)}>
			<div className={'mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-300'}>
				<IconWallet className={'h-6 w-6 text-neutral-700'} />
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
