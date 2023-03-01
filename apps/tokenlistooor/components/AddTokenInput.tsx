import React, {useCallback, useState} from 'react';
import IconCheck from 'apps/common/icons/IconCheck';
import IconCircleCross from 'apps/common/icons/IconCircleCross';
import {ethers} from 'ethers';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';

type TAddTokenInput = {
	token: string,
	onChange: (token: string) => void,
	onRemove: () => void;
	isAlreadyInList: boolean;
}
function	AddTokenInput({token, onChange, onRemove, isAlreadyInList}: TAddTokenInput): ReactElement {
	const	{provider} = useWeb3();
	const	[isValidERC20, set_isValidERC20] = useState<boolean>(false);
	const	[isLoading, set_isLoading] = useState<boolean>(false);
	const	[decimals, set_decimals] = useState<number | undefined>();
	const	[symbol, set_symbol] = useState<string | undefined>();

	const	checkDestinationValidity = useCallback(async (): Promise<void> => {
		if (!isZeroAddress(toAddress(token))) {
			set_isLoading(true);
			const	erc20Contract = new ethers.Contract(toAddress(token), [
				'function symbol() external view returns (string)',
				'function decimals() external view returns (uint8)'
			], provider || getProvider(1));
			const	result = await Promise.allSettled([erc20Contract.symbol(), erc20Contract.decimals()]);
			const	erc20Symbol = result[0].status === 'fulfilled' ? result[0].value : '';
			const	erc20Decimals = result[1].status === 'fulfilled' ? result[1].value : 0;

			if (erc20Symbol === '0' && erc20Decimals === 0) {
				performBatchedUpdates((): void => {
					set_isLoading(false);
					set_isValidERC20(false);
				});
			} else {
				performBatchedUpdates(async (): Promise<void> => {
					set_isLoading(false);
					set_isValidERC20(true);
					set_decimals(erc20Decimals);
					set_symbol(erc20Symbol);
				});
			}
		} else {
			set_isValidERC20(false);
		}
	}, [token, provider]);

	useUpdateEffect((): void => {
		set_isValidERC20(false);
		checkDestinationValidity();
	}, [checkDestinationValidity]);

	const	isInvalid = ((!isValidERC20 || isAlreadyInList) && token !== '' && !isLoading);
	return (
		<div className={'grid w-full grid-cols-12 gap-4'}>
			<div className={'col-span-6'}>
				<div className={'box-0 grow-1 flex h-10 w-full items-center p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
						<input
							aria-invalid={!isValidERC20}
							onBlur={async (): Promise<void> => checkDestinationValidity()}
							required
							placeholder={'0x...'}
							value={token}
							onChange={(e): void => onChange(e.target.value)}
							className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none scrollbar-none'}
							type={'text'} />
					</div>
					<div className={`tooltip ${isInvalid ? '!cursor-help' : '!cursor-text'}`}>
						<div className={'pointer-events-none relative h-4 w-4'}>
							<IconCheck
								className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isValidERC20 && !isAlreadyInList ? 'opacity-100' : 'opacity-0'}`} />
							<IconCircleCross
								className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${isInvalid ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
							<div className={'absolute inset-0 flex items-center justify-center'}>
								<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0'}`} />
							</div>
						</div>
						{isInvalid ? (
							<span className={'tooltiptext z-[100000] text-xs'}>
								<p>{isAlreadyInList ? 'This token is already in the list' : 'This is not a valid ERC20 token'}</p>
							</span>
						) : null}
					</div>

				</div>
			</div>

			<div className={'col-span-3'}>
				<div className={'box-0 grow-1 flex h-10 w-full items-center p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
						<input
							placeholder={''}
							value={symbol}
							className={'w-full cursor-not-allowed overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none scrollbar-none'}
							readOnly
							type={'text'} />
					</div>
				</div>
			</div>

			<div className={'col-span-3 flex flex-row space-x-2'}>
				<div className={'box-0 grow-1 flex h-10 w-full items-center p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
						<input
							placeholder={''}
							value={decimals}
							className={'w-full cursor-not-allowed overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none scrollbar-none'}
							readOnly
							type={'text'} />
					</div>
				</div>
				<button
					onClick={onRemove}
					className={'cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'}>
					<svg
						className={'h-3 w-3'}
						xmlns={'http://www.w3.org/2000/svg'}
						viewBox={'0 0 320 512'}>
						<path d={'M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z'} fill={'currentColor'}/>
					</svg>
				</button>
			</div>
		</div>
	);
}

export default AddTokenInput;
