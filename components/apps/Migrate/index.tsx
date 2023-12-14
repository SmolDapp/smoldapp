import React, {useCallback} from 'react';
import useWallet from 'contexts/useWallet';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import {IconSpinner} from '@icons/IconSpinner';
import {toAddress} from '@utils/tools.address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {AddressLikeInput} from '@common/AddressLikeInput';
import TokenInput from '@common/TokenInput';

import {useMigrate} from './useMigrate';
import {MigrateWizard} from './Wizard';

import type {TInputAddressLike} from 'components/designSystem/SmolAddressInput';
import type {ReactElement} from 'react';
import type {TToken} from '@utils/types/types';

function MigrateTokenRow(props: {index: number; token: TToken}): ReactElement {
	const {configuration, dispatchConfiguration} = useMigrate();
	const {getBalance} = useWallet();
	const onSelect = useCallback(
		async (rawAmount: bigint): Promise<void> => {
			if (rawAmount === 0n) {
				dispatchConfiguration({
					type: 'DEL_TOKEN',
					payload: props.token
				});
			} else {
				dispatchConfiguration({
					type: 'ADD_TOKEN',
					payload: {
						...props.token,
						amount: toNormalizedBN(rawAmount, props.token.decimals)
					}
				});
			}
		},
		[dispatchConfiguration, props.token]
	);

	return (
		<TokenInput
			index={props.index}
			token={props.token}
			placeholder={`${getBalance(props.token.address).normalized}`}
			value={configuration.tokens[props.token.address]?.amount || undefined}
			onChange={async v => onSelect(v.raw)}
		/>
	);
}

export function Migrate(): ReactElement {
	const {configuration, dispatchConfiguration} = useMigrate();
	const {isLoading} = useWallet();
	const tokensWithBalance = useTokensWithBalance();

	return (
		<section>
			<div className={'grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col text-neutral-900'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Where to migrate?'}</b>
						<p className={'text-neutral-500 text-sm'}>
							{
								'Enter the address where you want to migrate your funds to. Be sure to double check the address before proceeding.'
							}
						</p>
					</div>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4'}>
						<div className={'col-span-12 flex w-full flex-col'}>
							<small className={'pb-1 pl-1'}>{'Destination'}</small>
							<AddressLikeInput
								uuid={toAddress(configuration.receiver?.address)}
								label={configuration.receiver?.label || ''}
								onChangeLabel={(label): void =>
									dispatchConfiguration({
										type: 'SET_RECEIVER',
										payload: {...(configuration.receiver as TInputAddressLike), label}
									})
								}
								onChange={(address): void => {
									dispatchConfiguration({
										type: 'SET_RECEIVER',
										payload: {
											...(configuration.receiver as TInputAddressLike),
											address: toAddress(address)
										}
									});
								}}
								onPaste={(_, pasted): void => {
									dispatchConfiguration({
										type: 'SET_RECEIVER',
										payload: {
											...(configuration.receiver as TInputAddressLike),
											label: pasted
										}
									});
								}}
							/>
						</div>

						<div className={'col-span-12 flex w-full flex-col'}>
							<div className={'mb-2 grid grid-cols-2 gap-4'}>
								<p className={'text-neutral-500 text-xs'}>{'Token'}</p>
								<p className={'text-neutral-500 text-xs'}>{'Amount'}</p>
							</div>
							<div>
								{tokensWithBalance.length === 0 && isLoading ? (
									<div
										className={
											'col-span-12 flex min-h-[200px] flex-col items-center justify-center'
										}>
										<IconSpinner />
										<p className={'text-neutral-500 mt-6 text-sm'}>
											{'We are looking for your tokens ...'}
										</p>
									</div>
								) : tokensWithBalance.length === 0 ? (
									<div
										className={
											'col-span-12 flex min-h-[200px] flex-col items-center justify-center'
										}>
										<svg
											className={'h-4 w-4 text-neutral-400'}
											xmlns={'http://www.w3.org/2000/svg'}
											viewBox={'0 0 512 512'}>
											<path
												d={
													'M505 41c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L396.5 81.5C358.1 50.6 309.2 32 256 32C132.3 32 32 132.3 32 256c0 53.2 18.6 102.1 49.5 140.5L7 471c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l74.5-74.5c38.4 31 87.3 49.5 140.5 49.5c123.7 0 224-100.3 224-224c0-53.2-18.6-102.1-49.5-140.5L505 41zM362.3 115.7L115.7 362.3C93.3 332.8 80 295.9 80 256c0-97.2 78.8-176 176-176c39.9 0 76.8 13.3 106.3 35.7zM149.7 396.3L396.3 149.7C418.7 179.2 432 216.1 432 256c0 97.2-78.8 176-176 176c-39.9 0-76.8-13.3-106.3-35.7z'
												}
												fill={'currentcolor'}
											/>
										</svg>
										<p className={'text-neutral-500 mt-6 text-sm'}>
											{"Oh no, we couldn't find any token!"}
										</p>
									</div>
								) : (
									<div className={'grid grid-cols-1 gap-3'}>
										{tokensWithBalance.map(
											(token, index): ReactElement => (
												<span key={`${token.address}-${token.chainID}-${token.symbol}`}>
													<MigrateTokenRow
														index={10_000 - index}
														token={token}
													/>
												</span>
											)
										)}
									</div>
								)}
							</div>
						</div>

						<MigrateWizard />
					</form>
				</div>
			</div>
		</section>
	);
}
