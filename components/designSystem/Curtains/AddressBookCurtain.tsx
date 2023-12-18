'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/router';
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
import {isAddress, safeAddress, toAddress} from '@utils/tools.address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {AddressBookEntryAvatar} from '../AddressBookEntry';
import {NetworkDropdownSelector} from '../NetworkSelector/Dropdown';
import {SmolAddressInputSimple} from '../SmolAddressInput.simple';

import type {TAddressBookEntryReducer} from 'pages/apps/address-book';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
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
			role={'switch'}
			onClick={props.onClick}
			className={'withRing -mr-1 -mt-1 rounded p-1'}>
			<div className={'group relative flex h-4 w-4 items-center justify-center'}>
				<IconHeart
					className={cl(
						'absolute h-4 w-4 transition-colors',
						props.isFavorite
							? 'text-transparent group-hover:text-neutral-600'
							: 'text-neutral-600 group-hover:text-transparent'
					)}
				/>
				<IconHeartFilled
					className={cl(
						'absolute h-4 w-4 transition-colors',
						props.isFavorite ? 'text-neutral-600' : 'text-transparent group-hover:text-neutral-600'
					)}
				/>
			</div>
		</button>
	);
}

function ActionButtons(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	onOpenChange: (props: {isOpen: boolean; isEditing: boolean}) => void;
	onEdit: Dispatch<SetStateAction<boolean>>;
}): ReactElement {
	const {deleteEntry} = useAddressBook();

	const onDelete = useCallback(() => {
		if (props.selectedEntry.address) {
			deleteEntry(props.selectedEntry.address);
		}
		props.onOpenChange({isOpen: false, isEditing: false});
	}, [deleteEntry, props]);

	return (
		<div className={'flex gap-2'}>
			<FavoriteToggle
				isFavorite={Boolean(props.selectedEntry.isFavorite)}
				onClick={() => props.dispatch({type: 'SET_IS_FAVORITE', payload: !props.selectedEntry.isFavorite})}
			/>

			<button
				className={'withRing -mr-1 -mt-1 rounded p-1'}
				onClick={() => props.onEdit(isEditMode => !isEditMode)}>
				<IconEdit className={'h-4 w-4 text-neutral-600 transition-colors hover:text-neutral-900'} />
			</button>

			<button
				className={'withRing -mr-1 -mt-1 rounded p-1'}
				onClick={onDelete}>
				<IconTrash className={'h-4 w-4 text-neutral-600 transition-colors hover:text-neutral-900'} />
			</button>
		</div>
	);
}
function NameInput(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	onEdit: (shouldEdit: boolean) => void;
	isEditMode: boolean;
}): ReactElement {
	const labelRef = useRef<HTMLDivElement>(null);

	const errorMessage = useMemo((): string | undefined => {
		if (props.selectedEntry.label.startsWith('0x')) {
			return 'The name cannot starts with `0x`';
		}
		if (props.selectedEntry.label.includes('.')) {
			return 'The name cannot contains `.`';
		}
		if (props.selectedEntry.label.length > 22) {
			return 'The name cannot be longer than 22 characters';
		}
		return undefined;
	}, [props.selectedEntry.label]);

	return (
		<div
			ref={labelRef}
			onDoubleClick={() => {
				props.onEdit(true);
				setTimeout(() => labelRef.current?.focus(), 0);
			}}>
			<div className={'flex items-center justify-between'}>
				<label htmlFor={'name'}>
					<small className={'pl-1'}>{'Name'}</small>
				</label>
				<small className={'pr-1 text-red'}>{errorMessage}</small>
			</div>
			<TextInput
				disabled={!props.isEditMode}
				id={'name'}
				pattern={'^(?!0x)[^.]*$'}
				title={"The string must not start with '0x' and must not contain '.'"}
				tabIndex={0}
				minLength={1}
				maxLength={22}
				aria-invalid={
					props.selectedEntry.label.startsWith('0x') ||
					props.selectedEntry.label.includes('.') ||
					props.selectedEntry.label.length > 22
				}
				value={props.selectedEntry.label}
				onChange={label => props.dispatch({type: 'SET_LABEL', payload: label})}
			/>
		</div>
	);
}
function AddressInput(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	onEdit: (shouldEdit: boolean) => void;
	isEditMode: boolean;
	onChangeAddressLike: (addressLike: TInputAddressLike) => void;
	addressLike: TInputAddressLike;
}): ReactElement {
	const addressRef = useRef<HTMLDivElement>(null);
	const {onChangeAddressLike, selectedEntry} = props;

	useEffect(() => {
		onChangeAddressLike({
			address: selectedEntry.address,
			label: safeAddress({
				address: selectedEntry.address,
				ens: selectedEntry.ens
			}),
			isValid: isAddress(selectedEntry.address) ? true : 'undetermined',
			source: 'defaultValue'
		});
	}, [onChangeAddressLike, selectedEntry.address, selectedEntry.ens]);

	return (
		<div
			ref={addressRef}
			onDoubleClick={() => {
				props.onEdit(true);
				setTimeout(() => addressRef.current?.focus(), 0);
			}}>
			<label htmlFor={'address'}>
				<small className={'pl-1'}>{'Address'}</small>
			</label>
			<SmolAddressInputSimple
				disabled={!props.isEditMode}
				required
				tabIndex={0}
				value={props.addressLike}
				onChange={onChangeAddressLike}
				id={'address'}
			/>
		</div>
	);
}

function ChainsInput(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	onEdit: (shouldEdit: boolean) => void;
	isEditMode: boolean;
}): ReactElement {
	//Note: Cannot dynamic open the modal without heavy adaptation
	return (
		<label>
			<small className={'pl-1'}>{'Chains'}</small>
			<NetworkDropdownSelector
				disabled={!props.isEditMode}
				value={props.selectedEntry.chains}
				onChange={chains => {
					props.dispatch({type: 'SET_CHAINS', payload: chains});
				}}
			/>
		</label>
	);
}

export function AddressBookCurtain(props: {
	selectedEntry: TAddressBookEntry;
	dispatch: Dispatch<TAddressBookEntryReducer>;
	isOpen: boolean;
	isEditing: boolean;
	onOpenChange: (props: {isOpen: boolean; isEditing: boolean}) => void;
}): ReactElement {
	const router = useRouter();
	const {updateEntry} = useAddressBook();
	const [isEditMode, set_isEditMode] = useState<boolean>(props.isEditing);
	const [addressLike, set_addressLike] = useState<TInputAddressLike>({
		address: props.selectedEntry.address,
		label: safeAddress({
			address: props.selectedEntry.address,
			ens: props.selectedEntry.ens,
			addrOverride: props.selectedEntry.address?.substring(0, 6)
		}),
		isValid: isAddress(props.selectedEntry.address) ? true : 'undetermined',
		source: 'defaultValue'
	});

	useEffect(() => {
		set_isEditMode(props.isEditing);
	}, [props.isEditing]);

	const onFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!isEditMode) {
				const URLQueryParam = new URLSearchParams();
				URLQueryParam.set('to', toAddress(addressLike.address));
				return router.push({
					pathname: '/apps/send',
					query: URLQueryParam.toString()
				});
			}
			if (props.selectedEntry.id === undefined) {
				updateEntry({...props.selectedEntry, address: addressLike.address});
				props.onOpenChange({isOpen: false, isEditing: false});
			} else {
				updateEntry({...props.selectedEntry, address: addressLike.address});
				set_isEditMode(false);
				props.onOpenChange({isOpen: true, isEditing: false});
			}
			return;
		},
		[addressLike, isEditMode, props, router, updateEntry]
	);

	return (
		<Dialog.Root
			open={props.isOpen}
			onOpenChange={isOpen => props.onOpenChange({isOpen, isEditing: isEditMode})}>
			<CurtainContent className={'focus:!border-green'}>
				<aside
					style={{boxShadow: '-8px 0px 20px 0px rgba(36, 40, 51, 0.08)'}}
					className={'flex h-full flex-col overflow-y-hidden bg-neutral-0 p-6'}>
					<button
						aria-label={'Hack to prevent focus on fav on mount'}
						className={'pointer-events-none h-0 w-0 opacity-0'}
						tabIndex={0}
					/>
					<div className={'mb-4 flex flex-row items-center justify-between'}>
						<ActionButtons
							{...props}
							onEdit={set_isEditMode}
						/>
						<CloseCurtainButton />
					</div>

					<div className={'flex items-center justify-center pb-6'}>
						<EntryAvatarWrapper address={addressLike.address || toAddress(props.selectedEntry.address)} />
					</div>

					<form
						onSubmit={onFormSubmit}
						className={'flex h-full flex-col gap-4'}>
						<NameInput
							{...props}
							onEdit={set_isEditMode}
							isEditMode={isEditMode}
						/>

						<AddressInput
							{...props}
							addressLike={addressLike}
							onChangeAddressLike={set_addressLike}
							onEdit={set_isEditMode}
							isEditMode={isEditMode}
						/>

						<ChainsInput
							{...props}
							onEdit={set_isEditMode}
							isEditMode={isEditMode}
						/>

						<Button
							tabIndex={0}
							type={'submit'}
							isDisabled={
								addressLike.isValid !== true ||
								props.selectedEntry.label === '' ||
								props.selectedEntry.label.startsWith('0x') ||
								props.selectedEntry.label.includes('.')
							}
							className={'!h-10 w-1/2'}>
							{isEditMode ? (props.selectedEntry.id === undefined ? 'Add' : 'Update') : 'Send'}
						</Button>
					</form>
				</aside>
			</CurtainContent>
		</Dialog.Root>
	);
}
