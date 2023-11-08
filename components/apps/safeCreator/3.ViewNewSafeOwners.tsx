import React, {useCallback, useState} from 'react';
import IconInfo from 'components/icons/IconInfo';
import IconWarning from 'components/icons/IconWarning';
import {useMountEffect} from '@react-hookz/web';
import AddressLikeInput from '@safeCreatooor/AddressLikeInput';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TOwners = {
	address: TAddress | undefined;
	label: string;
	UUID: string;
};

export function newVoidOwner(): TOwners {
	return {
		address: undefined,
		label: '',
		UUID: crypto.randomUUID()
	};
}

type TViewNewSafeOwnersProps = {
	onUpdateSafeSettings: (owners: TAddress[], threshold: number) => void;
};
function ViewNewSafeOwners(props: TViewNewSafeOwnersProps): ReactElement {
	const [owners, set_owners] = useState<TOwners[]>([newVoidOwner()]);
	const [threshold, set_threshold] = useState(1);

	useMountEffect((): void => {
		set_owners([newVoidOwner()]);
	});

	const checkOwnerAlreadyExists = useCallback(
		(UUID: string, address: TAddress): boolean => {
			if (isZeroAddress(address)) {
				return false;
			}
			return owners.some((owner): boolean => owner.UUID !== UUID && owner.address === address);
		},
		[owners]
	);

	function onUpdateOwnerAddressByUUID(UUID: string, address: string | undefined): void {
		set_owners(
			owners.map((row): TOwners => {
				if (row.UUID !== UUID) {
					return row;
				}
				if (!address || isZeroAddress(address)) {
					return {...row, address: undefined};
				}
				return {...row, address: toAddress(address)};
			})
		);
	}
	function onUpdateOwnerLabelByUUID(UUID: string, label: string): void {
		set_owners(
			owners.map((row): TOwners => {
				if (row.UUID !== UUID) {
					return row;
				}
				return {...row, label};
			})
		);
	}
	function onAddNewOwnerAsSibling(UUID: string): void {
		set_owners(
			owners.reduce((acc, row): TOwners[] => {
				if (row.UUID === UUID) {
					return [...acc, row, newVoidOwner()];
				}
				return [...acc, row];
			}, [] as TOwners[])
		);
	}
	function onRemoveOwnerByUUID(UUID: string): void {
		if (owners.length === 1) {
			return set_owners([newVoidOwner()]);
		}
		set_owners(owners.filter((row): boolean => row.UUID !== UUID));
	}

	function onHandleMultiplePaste(UUID: string, pasted: string): void {
		const separators = [' ', '-', ';', ',', '.'];
		const addressAmounts = pasted.split('\n').map((line): [string, string] => {
			let cleanedLine = separators.reduce(
				(acc, separator): string => acc.replaceAll(separator + separator, separator),
				line
			);
			for (let i = 0; i < 3; i++) {
				cleanedLine = separators.reduce(
					(acc, separator): string => acc.replaceAll(separator + separator, separator),
					cleanedLine
				);
			}

			const addressAmount = cleanedLine.split(
				separators.find((separator): boolean => cleanedLine.includes(separator)) ?? ' '
			);
			return [addressAmount[0], addressAmount[1]];
		});
		const newRows = addressAmounts.map((addressAmount): TOwners => {
			const row = newVoidOwner();
			row.address = toAddress(addressAmount[0]);
			row.label = String(addressAmount[0]);
			return row;
		});
		set_owners(
			owners.reduce((acc, row): TOwners[] => {
				if (row.UUID === UUID) {
					if (row.address && !isZeroAddress(row.address)) {
						return [...acc, row, ...newRows];
					}
					return [...acc, ...newRows];
				}
				return [...acc, row];
			}, [] as TOwners[])
		);
	}

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'One new Safe, coming right up.'}
					content={
						'Your Safe needs owners. Let us know the other addresses or ENS of the accounts you want to be in charge of your Safe alongside you.'
					}
				/>
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'items-center justify-between gap-4 md:gap-6'}>
						<div className={'w-full'}>
							{owners.map(
								({UUID}, i): ReactElement => (
									<div
										className={'mb-2 flex flex-row space-x-4'}
										key={UUID}>
										<AddressLikeInput
											shouldAutoFocus={i === 0}
											uuid={UUID}
											isDuplicate={checkOwnerAlreadyExists(UUID, toAddress(owners[i].address))}
											label={owners[i].label}
											onChangeLabel={(label): void => onUpdateOwnerLabelByUUID(UUID, label)}
											onChange={(address): void => onUpdateOwnerAddressByUUID(UUID, address)}
											onPaste={onHandleMultiplePaste}
										/>
										<div
											tabIndex={-1}
											style={
												i !== 0
													? {visibility: 'visible'}
													: {visibility: 'hidden', pointerEvents: 'none'}
											}
											className={'flex flex-row items-center justify-center space-x-4'}>
											<button
												type={'button'}
												tabIndex={-1}
												className={
													'flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-0 text-center text-xl text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-0'
												}
												onClick={(): void => onRemoveOwnerByUUID(UUID)}>
												<p className={'font-number pr-[1px]'}>{'-'}</p>
											</button>
										</div>
									</div>
								)
							)}
						</div>

						<div className={'-mt-4 mr-0 flex flex-col md:mr-14 md:mt-4'}>
							<div className={'mt-4 flex flex-col items-start justify-between space-x-4 md:flex-row'}>
								<button
									type={'button'}
									onClick={(): void => onAddNewOwnerAsSibling(owners[owners.length - 1].UUID)}
									className={
										'group -mt-4 rounded-md border border-transparent py-2 pl-1 pr-0 focus:underline md:mt-[-36px] md:pr-20'
									}>
									<b className={'text-xs text-neutral-900 group-hover:underline'}>
										{'+ Add a new owner'}
									</b>
								</button>
								<div className={'mt-0 flex w-full justify-end px-4 md:mt-[-10px] md:w-auto md:px-0'}>
									<div className={'mb-2 flex flex-row items-center space-x-2'}>
										<div className={'box-0 relative flex h-10 w-full items-center'}>
											<div className={'absolute right-[110%] text-xs text-neutral-600'}>
												<div className={'flex w-fit flex-row items-center space-x-1'}>
													<p className={'font-inter font-semibold opacity-50'}>
														{'Threshold'}
													</p>
													<span className={'tooltip'}>
														<IconInfo className={'h-3 w-3 text-neutral-500 opacity-50'} />
														<span className={'tooltipLight top-full mt-1'}>
															<div
																className={
																	'font-number w-40 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
																}>
																<p>
																	{
																		'Any transaction requires the confirmation of at least this number of owners. You can change this later.'
																	}
																</p>
															</div>
														</span>
													</span>
												</div>
											</div>
											<div
												className={
													'flex h-10 w-full flex-row items-center justify-between space-x-2 px-2 py-4'
												}>
												<button
													type={'button'}
													className={
														'flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-center text-neutral-0 outline outline-offset-2 transition-colors focus-within:outline-primary-600 hover:bg-primary-800 disabled:opacity-10'
													}
													disabled={threshold <= 1}
													onClick={(): void => set_threshold(threshold - 1)}>
													<svg
														className={'h-3 w-3'}
														xmlns={'http://www.w3.org/2000/svg'}
														height={'1em'}
														viewBox={'0 0 448 512'}>
														<path
															d={
																'M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z'
															}
															fill={'currentColor'}
														/>
													</svg>
												</button>
												<p className={'font-number'}>{threshold}</p>
												<button
													type={'button'}
													className={
														'flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-center text-neutral-0 outline outline-offset-2 transition-colors focus-within:outline-primary-600 hover:bg-primary-800 disabled:opacity-10'
													}
													disabled={threshold >= owners.length}
													onClick={(): void => set_threshold(threshold + 1)}>
													<svg
														className={'h-3 w-3'}
														xmlns={'http://www.w3.org/2000/svg'}
														height={'1em'}
														viewBox={'0 0 448 512'}>
														<path
															d={
																'M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z'
															}
															fill={'currentColor'}
														/>
													</svg>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div
								className={
									'flex flex-col justify-between space-x-0 space-y-2 md:flex-row md:space-x-4 md:space-y-0'
								}>
								<div
									className={'w-full md:-mt-1 md:w-3/4'}
									style={{display: owners.length === 1 ? 'flex' : 'none'}}>
									<div
										className={
											'flex flex-row rounded-md border border-orange-200 !bg-orange-200/60 p-2 text-xs font-bold text-orange-600 md:whitespace-pre'
										}>
										<IconWarning className={'mr-2 h-4 w-4 min-w-[16px] text-orange-600'} />
										{
											'We recomend a threshold of at least 1/2.\nYou can use any other wallet or even the Safe app on your phone as another owner.'
										}
									</div>
								</div>
								<Button
									isDisabled={owners.some(
										(owner): boolean => !owner.address || isZeroAddress(owner.address)
									)}
									onClick={(): void =>
										props.onUpdateSafeSettings(
											owners.map((o): TAddress => toAddress(o.address)),
											threshold
										)
									}>
									{'Customize my Safe'}
								</Button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ViewNewSafeOwners;
