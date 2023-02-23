import {useCallback, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {useWallet} from 'contexts/useWallet';
import {ethers} from 'ethers';
import {isAddress} from 'ethers/lib/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {ReactElement} from 'react';

function	CustomTokenSelector(): ReactElement {
	const	{provider} = useWeb3();
	const	{refresh} = useWallet();
	const	[erc20Address, set_erc20Address] = useState<string>('');
	const	[isValidERC20, set_isValidERC20] = useState<boolean>(false);
	const	[isLoading, set_isLoading] = useState<boolean>(false);
	const	[validERC20Data, set_validERC20Data] = useState<TUseBalancesTokens | undefined>();

	const	checkDestinationValidity = useCallback(async (): Promise<void> => {
		if (!isZeroAddress(toAddress(erc20Address))) {
			set_isLoading(true);
			const	erc20Contract = new ethers.Contract(erc20Address, [
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
					set_validERC20Data({
						token: erc20Address,
						symbol: erc20Symbol,
						decimals: erc20Decimals,
						force: true
					});
				});
			}
		} else {
			set_isValidERC20(false);
		}
	}, [erc20Address, provider]);

	useUpdateEffect((): void => {
		set_isValidERC20(false);
		checkDestinationValidity();
	}, [checkDestinationValidity]);

	return (
		<div className={'w-full'}>
			<div>
				<label className={'text-xs'}>{'Token Address'}</label>
				<div className={'box-0 grow-1 col-span-12 flex h-10 w-full items-center p-2 md:col-span-9'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
						<input
							aria-invalid={!isValidERC20}
							onBlur={async (): Promise<void> => checkDestinationValidity()}
							required
							placeholder={'0x...'}
							value={erc20Address}
							onChange={(e): void => set_erc20Address(e.target.value)}
							className={'scrollbar-none w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none'}
							type={'text'} />
					</div>
					<div className={'pointer-events-none relative h-4 w-4'}>
						<IconCheck
							className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isValidERC20 ? 'opacity-100' : 'opacity-0'}`} />
						<IconCircleCross
							className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${(!isValidERC20 && erc20Address !== '' && !isLoading) ? 'opacity-100' : 'opacity-0'}`} />
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0'}`} />
						</div>
					</div>
				</div>
			</div>

			<div className={'mt-2 flex w-full flex-row items-center space-x-4'}>
				<div className={'grow'}>
					<label className={'text-xs'}>{'Symbol'}</label>
					<div className={'box-100 grow-1 col-span-12 flex h-10 w-full items-center p-2 md:col-span-9'}>
						<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
							<input
								placeholder={''}
								value={validERC20Data?.symbol}
								className={'scrollbar-none w-full cursor-not-allowed overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none'}
								readOnly
								type={'text'} />
						</div>
					</div>
				</div>
				<div className={'grow'}>
					<label className={'text-xs'}>{'Decimals'}</label>
					<div className={'box-100 grow-1 col-span-12 flex h-10 w-full items-center p-2 md:col-span-9'}>
						<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
							<input
								placeholder={''}
								value={validERC20Data?.decimals}
								className={'scrollbar-none w-full cursor-not-allowed overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none'}
								readOnly
								type={'number'} />
						</div>
					</div>
				</div>
			</div>
			<div className={'mt-4'}>
				<Button
					className={'yearn--button !w-[160px] rounded-md !text-sm'}
					disabled={!isAddress(erc20Address) || !isValidERC20 || !validERC20Data}
					onClick={(): void => {
						if (validERC20Data) {
							refresh([validERC20Data]).then((): void => {
								performBatchedUpdates((): void => {
									set_erc20Address('');
									set_isValidERC20(false);
								});
							});
						}

					}}>
					{'Add token'}
				</Button>
			</div>
		</div>
	);
}

export default CustomTokenSelector;
