import React, {useCallback,useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {DefaultSeo} from 'next-seo';
import assert from 'assert';
import IconWarning from 'components/icons/IconWarning';
import {useConnect, usePublicClient} from 'wagmi';
import {AddressBookContextApp, useAddressBook} from '@addressBook/useAddressBook';
import {isNullAddress} from '@addressBook/utils';
import {Listbox} from '@headlessui/react';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toSafeChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {IconChevronBottom} from '@yearn-finance/web-lib/icons/IconChevronBottom';
import {isZeroAddress} from '@yearn-finance/web-lib/utils/address';
import AddressInput, {defaultInputAddressLike} from '@common/AddressInput';

import type {ReactElement} from 'react';
import type {Chain} from 'wagmi';
import type {TCategory} from '@addressBook/useAddressBook';
import type {TInputAddressLike} from '@common/AddressInput';

const categories: TCategory[] = [
	{value: 1, label: 'category 1'},
	{value: 2, label: 'category 2'},
	{value: 3, label: 'category 3'}
];
type TNetwork = {value: number, label: string};

function CreateAddress(): ReactElement {
	const router = useRouter();
	const {addressBook, set_addressBook} = useAddressBook();
	const [address, set_address] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [description, set_description] = useState<string>('');
	const [selectedCategory, set_selectedCategory] = useState<TCategory>();
	const [selectedChainNetwork, set_selectedChainNetwork] = useState<TNetwork>();

	const checkAlreadyExists = useCallback((address: string): boolean => {
		return addressBook.some((row): boolean => row.address === address);
	}, [addressBook]);

	const publicClient = usePublicClient();
	const {connectors} = useConnect();
	const safeChainID = toSafeChainID(publicClient?.chain.id, Number(process.env.BASE_CHAINID));

	const supportedNetworks = useMemo((): TNetwork[] => {
		const injectedConnector = connectors.find((e): boolean => (e.id).toLocaleLowerCase() === 'injected');
		assert(injectedConnector, 'No injected connector found');
		const chainsForInjected = injectedConnector.chains;

		return (
			chainsForInjected
				.filter(({id}): boolean => (
					![5, 1337, 84531].includes(id)
				))
				.map((network: Chain): TNetwork => (
					{value: network.id, label: network.name}
				))
		);
	}, [connectors]);
	const currentNetwork = useMemo((): TNetwork | undefined => (
		supportedNetworks.find((network): boolean => network.value === safeChainID)
	), [safeChainID, supportedNetworks]);

	useEffect((): void => {
		set_selectedChainNetwork(currentNetwork);
	}, [currentNetwork]);

	const isValid = useMemo((): boolean => {
		if (!address.address || isZeroAddress(address.address) || isNullAddress(address.address)) {
			return false;
		}
		if (checkAlreadyExists(address.address)) {
			return false;
		}
		return true;
	}, [address, checkAlreadyExists]);

	return (
		<div className={'mx-auto grid w-full max-w-4xl gap-8'}>
			<div className={'mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-2/3 md:text-3xl'}>
					{'Add new address to the Address Book'}
				</h1>
			</div>

			<form
				suppressHydrationWarning
				onSubmit={async (e): Promise<void> => e.preventDefault()}
				className={'grid flex-row items-center gap-4 md:w-3/4 md:gap-6'}
			>
				<AddressInput
					value={address}
					onChangeValue={(e): void => set_address(e)}
				/>
				<div className={'smol--input-wrapper h-auto py-0'}>
					<textarea
						id={'description'}
						cols={30}
						rows={4}
						maxLength={400}
						className={'smol--input font-mono font-bold'}
						onChange={({target:{value}}): void => set_description(value)}
						placeholder={'Description of the address'}
					/>
				</div>
				<div className={'smol--input-wrapper relative'}>
					<Listbox
						value={selectedCategory?.value}
						onChange={(value: number): void => {
							set_selectedCategory(categories.find((category): boolean => category.value === value));
						}}
					>
						{({open}): ReactElement => (
							<>
								<Listbox.Button className={`smol--input text-left font-mono font-bold ${!selectedCategory?.label && 'text-neutral-400'}`}						>
									{selectedCategory?.label || 'Category...'}
								</Listbox.Button>
								<IconChevronBottom className={`h-3 w-3 transition-transform md:h-5 md:w-4 ${open ? '-rotate-180' : 'rotate-0'}`} />
								<Listbox.Options className={'absolute left-0 top-12 z-10 w-full rounded-md bg-white p-2 shadow-lg'}>
									{categories.map((category): ReactElement => (
										<Listbox.Option
											key={category.value}
											value={category.value}
										>
											{({active}): ReactElement => (
												<li
													className={`${active ? 'bg-primary-300/50' : ''} cursor-pointer select-none p-2`}
												>
													{category.label}
												</li>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</>
						)}
					</Listbox>
				</div>
				<div className={'smol--input-wrapper relative'}>
					<Listbox
						value={selectedChainNetwork?.value}
						onChange={(value: number): void => {
							set_selectedChainNetwork(supportedNetworks.find((network): boolean => network.value === value));
						}}
					>
						{({open}): ReactElement => (
							<>
								<Listbox.Button className={`smol--input flex flex-row gap-2 text-left font-mono font-bold ${!selectedChainNetwork?.label && 'text-gray-500'}`}>
									{!!selectedChainNetwork && (
										<Image
											id={selectedChainNetwork.value.toString()}
											className={'min-h-[20px] min-w-[20px]'}
											src={`https://assets.smold.app/api/chain/${selectedChainNetwork.value}/logo-128.png`}
											width={20}
											height={20}
											alt={selectedChainNetwork.label}
										/>
									)}
									{selectedChainNetwork?.label || 'Network...'}
								</Listbox.Button>
								<IconChevronBottom className={`h-3 w-3 transition-transform md:h-5 md:w-4 ${open ? '-rotate-180' : 'rotate-0'}`} />
								<Listbox.Options className={'absolute left-0 top-12 z-10 w-full rounded-md bg-white p-2 shadow-lg'}>
									{supportedNetworks.map((network): ReactElement => (
										<Listbox.Option
											key={network.value}
											value={network.value}
										>
											{({active}): ReactElement => (
												<div className={`flex flex-row gap-2 ${active ? 'bg-primary-300/50' : ''} cursor-pointer select-none p-2`}>
													{!!network && (
														<Image
															id={network.value.toString()}
															className={'min-h-[20px] min-w-[20px]'}
															src={`https://assets.smold.app/api/chain/${network.value}/logo-128.png`}
															width={20}
															height={20}
															alt={network.label}
														/>
													)}
													{network.label}
												</div>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</>
						)}
					</Listbox>
				</div>
				<div className={'flex flex-row items-center gap-8'}>
					<Link href={'/address-book'}>
						<p className={'text-sm text-neutral-400 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'}>{'◁ Back'}</p>
					</Link>
					<Button
						variant={'filled'}
						className={'yearn--button !w-[160px] rounded-md'}
						onClick={(): void => {
							set_addressBook([
								...addressBook, {
									UUID: crypto.randomUUID(),
									address: address.address!,
									label: undefined,
									description: description,
									categories: selectedCategory ? [selectedCategory] : [],
									chainsID: selectedChainNetwork ? [selectedChainNetwork.value] : [],
									walletKind: 'EOA',
									isFavorite: false
								}
							]);
							router.replace('/address-book');
						}}
						disabled={!isValid}
					>
						{'Finish'}
					</Button>
				</div>
				<div className={'w-full md:-mt-1 md:w-3/4'} style={{display: !isValid ? 'flex' : 'none'}}>
					<div className={'flex flex-row rounded-md border border-orange-200 !bg-orange-200/60 p-2 text-xs font-bold text-orange-600 md:whitespace-pre'}>
						<IconWarning className={'mr-2 h-4 w-4 min-w-[16px] text-orange-600'} />
						{'You can\'t add this address, check if:\n- incorrect format\n- already exists\n- low priority'}
					</div>
				</div>
			</form>
		</div>
	);
}

export default function CreateAddressWrapper(): ReactElement {
	return (
		<AddressBookContextApp>
			<>
				<DefaultSeo
					title={'SmolSend - SmolDapp'}
					defaultTitle={'SmolSend - SmolDapp'}
					description={'Backend-less trusted address book for token transfers'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/address-book',
						site_name: 'SmolSend - SmolDapp',
						title: 'SmolSend - SmolDapp',
						description: 'Backend-less trusted address book for token transfers',
						images: [
							{
								url: 'https://smold.app/og_address-book.png',
								width: 800,
								height: 400,
								alt: 'smolSend'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<CreateAddress />
			</>
		</AddressBookContextApp>
	);
}
