'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {CloseCurtainButton} from 'components/designSystem/Curtains/InfoCurtain';
import {Button} from 'components/Primitives/Button';
import {CurtainContent} from 'components/Primitives/Curtain';
import {TextInput} from 'components/Primitives/TextInput';
import {type TAddressBookEntry, useAddressBook} from 'contexts/useAddressBook';
import {useEnsAvatar, useEnsName} from 'wagmi';
import {IconEdit} from '@icons/IconEdit';
import {IconHeart, IconHeartFilled} from '@icons/IconHeart';
import {IconTrash} from '@icons/IconTrash';
import * as Dialog from '@radix-ui/react-dialog';
import {safeAddress, toAddress} from '@utils/tools.address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {AddressBookEntryAvatar} from '../AddressBookEntry';
import {NetworkDropdownSelector} from '../NetworkSelector/Dropdown';
import {SmolAddressInputSimple} from '../SmolAddressInput.simple';

import type {TAddressBookEntryReducer} from 'pages/apps/address-book';
import type {Dispatch, ReactElement} from 'react';
import type {TAddress} from '@utils/tools.address';
import type {TInputAddressLike} from '../SmolAddressInput';

function EntryAvatarWrapper(props: {address: TAddress}): ReactElement {
	const {data: ensName} = useEnsName({
		chainId: 1,
		address: toAddress(props.address)
	});
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({
		chainId: 1,
		name: ensName,
		enabled: Boolean(ensName)
	});

	return (
		<AddressBookEntryAvatar
			isLoading={isLoadingAvatar}
			address={toAddress(props.address)}
			src={avatar}
			sizeClassname={'h-32 w-32 min-w-[128px]'}
		/>
	);
}

function FavoriteToggle(props: {isFavorite: boolean; onClick: () => void}): ReactElement {
	return (
		<button
			onClick={props.onClick}
			className={'group relative h-4 w-4'}>
			<IconHeart
				className={cl(
					'absolute h-4 w-4 transition-colors inset-0',
					props.isFavorite
						? 'text-transparent group-hover:text-neutral-600'
						: 'text-neutral-600 group-hover:text-transparent'
				)}
			/>
			<IconHeartFilled
				className={cl(
					'absolute h-4 w-4 transition-colors inset-0',
					props.isFavorite ? 'text-neutral-600' : 'text-transparent group-hover:text-neutral-600'
				)}
			/>
		</button>
	);
}

export function AddressBookCurtain(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}): ReactElement {
	const selectedAddressLike = useMemo(
		(): TInputAddressLike => ({
			address: props.selectedEntry.address,
			label: safeAddress({
				address: props.selectedEntry.address,
				ens: props.selectedEntry.ens,
				addrOverride: props.selectedEntry.address?.substring(0, 6)
			}),
			isValid: 'undetermined',
			source: 'defaultValue'
		}),
		[props.selectedEntry.address, props.selectedEntry.ens]
	);
	const [addressLike, set_addressLike] = useState<TInputAddressLike>(selectedAddressLike);
	const {updateEntry, deleteEntry} = useAddressBook();

	useEffect(() => {
		set_addressLike(selectedAddressLike);
	}, [selectedAddressLike]);

	return (
		<Dialog.Root
			open={props.isOpen}
			onOpenChange={props.onOpenChange}>
			<CurtainContent>
				<aside
					style={{boxShadow: '-8px 0px 20px 0px rgba(36, 40, 51, 0.08)'}}
					className={'flex h-full flex-col overflow-y-hidden bg-neutral-0 p-6'}>
					<div className={'mb-4 flex flex-row items-center justify-between'}>
						<div className={'flex gap-2'}>
							<FavoriteToggle
								isFavorite={Boolean(props.selectedEntry.isFavorite)}
								onClick={() =>
									props.dispatch({type: 'SET_IS_FAVORITE', payload: !props.selectedEntry.isFavorite})
								}
							/>
							<button>
								<IconEdit
									className={'h-4 w-4 text-neutral-600 transition-colors hover:text-neutral-900'}
								/>
							</button>
							<button
								onClick={() => {
									if (props.selectedEntry.address) {
										deleteEntry(props.selectedEntry.address);
									}
									props.onOpenChange(false);
								}}>
								<IconTrash
									className={'h-4 w-4 text-neutral-600 transition-colors hover:text-neutral-900'}
								/>
							</button>
						</div>
						<CloseCurtainButton />
					</div>
					<div className={'flex items-center justify-center pb-6'}>
						<EntryAvatarWrapper address={toAddress(props.selectedEntry.address)} />
					</div>
					<div className={'flex h-full flex-col gap-4'}>
						<div>
							<small className={'pl-1'}>{'Name'}</small>
							<TextInput
								value={props.selectedEntry.label}
								onChange={label => props.dispatch({type: 'SET_LABEL', payload: label})}
							/>
						</div>

						<div>
							<small className={'pl-1'}>{'Address'}</small>
							<SmolAddressInputSimple
								value={addressLike}
								onChange={set_addressLike}
							/>
						</div>

						<div>
							<small className={'pl-1'}>{'Chains'}</small>
							<NetworkDropdownSelector
								value={props.selectedEntry.chains}
								onChange={chains => {
									console.warn(chains);
									props.dispatch({type: 'SET_CHAINS', payload: chains});
								}}
							/>
						</div>
						<Button
							onClick={async () => updateEntry({...props.selectedEntry, address: addressLike.address})}>
							{'Save'}
						</Button>
					</div>
				</aside>
			</CurtainContent>
		</Dialog.Root>
	);
}
