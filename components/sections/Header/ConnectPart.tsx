import React from 'react';
import {useIsMounted} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {ReactElement} from 'react';

export function ConnectPart(): ReactElement {
	const isMounted = useIsMounted();
	const {openLoginModal, address, onDesactivate} = useWeb3();

	return (
		<div
			className={
				'font-number col-span-7 flex w-full flex-col border-l-0 border-neutral-200 pl-0 text-xs md:col-span-4 md:border-l md:pl-10 md:text-sm'
			}>
			<div className={'relative flex h-full w-full flex-col items-center justify-center'}>
				<div className={'box-0 grid h-full w-full grid-cols-3 grid-rows-4 gap-2 p-4'}>
					<div className={'h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-2 row-span-3 h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-1 row-span-2 h-full w-full rounded-md bg-primary-100'} />
					<div className={'col-span-3 row-span-2 h-full w-full rounded-md bg-primary-100'} />
				</div>
				{!address && !isMounted ? (
					<div className={'mt-2 flex w-full gap-2'}>
						<Button
							onClick={openLoginModal}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Connect wallet'}
							</p>
						</Button>
					</div>
				) : (
					<div
						key={'connected'}
						id={'connected'}
						className={'mt-2 flex w-full gap-2'}>
						<Button
							onClick={() => copyToClipboard(toAddress(address))}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Copy Address'}
							</p>
						</Button>
						<Button
							onClick={onDesactivate}
							variant={'filled'}
							className={'!h-8 min-h-[32px] w-full'}>
							<p
								suppressHydrationWarning
								className={'text-xs font-semibold'}>
								{'Disconnect'}
							</p>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
