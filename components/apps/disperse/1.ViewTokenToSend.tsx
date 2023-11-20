import React, {useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import {zeroAddress} from 'viem';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {MultipleTokenSelector} from '@common/TokenInput/TokenSelector';

import {useDisperseee} from './useDisperseee';

import type {ReactElement} from 'react';

function ViewTokenToSend({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useDisperseee();
	const [isValidTokenToReceive, set_isValidTokenToReceive] = useState<boolean | 'undetermined'>(true);
	const {openTokenListModal} = useTokenList();
	const tokensWithBalance = useTokensWithBalance();

	/**********************************************************************************************
	 ** When the tokenToDisperse token changes, check if it is a valid tokenToDisperse token. The
	 ** check is trivial as we only check if the address is valid.
	 *********************************************************************************************/
	useUpdateEffect((): void => {
		set_isValidTokenToReceive(!isZeroAddress(configuration.tokenToSend?.address));
	}, [configuration.tokenToSend]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Which token do you want to send?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Pick the token you’d like to disperse, (aka send to multiple recipients or wallets).'}
						</p>
					</div>
					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={cl(
							'mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4 md:gap-6'
						)}>
						<div className={'grow-1 col-span-12 flex w-full flex-col md:col-span-9'}>
							<MultipleTokenSelector
								token={configuration.tokenToSend}
								tokens={tokensWithBalance}
								onChangeToken={(newToken): void =>
									dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: newToken})
								}
							/>
						</div>
						<div className={'col-span-12 md:col-span-3'}>
							<Button
								variant={'filled'}
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={onProceed}
								isDisabled={
									!isValidTokenToReceive ||
									configuration.tokenToSend?.chainID === 0 ||
									toAddress(configuration.tokenToSend?.address) === zeroAddress
								}>
								{'Next'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ViewTokenToSend;
