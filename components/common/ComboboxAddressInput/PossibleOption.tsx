import {useMemo} from 'react';
import useWallet from 'contexts/useWallet';
import {Combobox} from '@headlessui/react';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TToken} from '@utils/types/types';

function Option(props: TToken): ReactElement {
	const {getBalance} = useWallet();

	return (
		<div className={'flex w-full flex-row items-center space-x-4'}>
			<div className={'size-6'}>
				<ImageWithFallback
					alt={''}
					unoptimized
					src={props.logoURI || ''}
					altSrc={`${process.env.SMOL_ASSETS_URL}/token/${props.chainID}/${props.address}/logo-32.png`}
					quality={90}
					width={24}
					height={24}
				/>
			</div>
			<div className={'flex flex-col font-sans text-neutral-900'}>
				<div className={'flex flex-row items-center'}>
					{props.symbol}
					&nbsp;
					<small className={'text-xxs'}>
						{`- ${formatAmount(getBalance(toAddress(props.address))?.normalized, 6, 6)} ${props.symbol}`}
					</small>
				</div>
				<small className={'font-number text-xs text-neutral-500'}>{toAddress(props.address)}</small>
			</div>
		</div>
	);
}

function PossibleOption({option}: {option: TToken}): ReactElement {
	const memorizedElement = useMemo<ReactElement>((): ReactElement => <Option {...option} />, [option]);

	return (
		<Combobox.Option
			className={({active: isActive}): string =>
				`relative cursor-pointer select-none py-2 px-4 ${
					isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-900'
				}`
			}
			value={option}>
			{({selected: isSelected}): ReactElement => (
				<div>
					{memorizedElement}
					{isSelected ? (
						<span className={'absolute inset-y-0 right-8 flex items-center'}>
							<IconCircleCheck className={'absolute size-4 text-neutral-900'} />
						</span>
					) : null}
				</div>
			)}
		</Combobox.Option>
	);
}

export {PossibleOption};
