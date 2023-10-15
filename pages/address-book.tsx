import React, { useCallback } from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/apps/0.ViewWallet';
import ViewAddressBookSection from '@addressBook/1.ViewAddressBookSection';
import ViewNewSafe from '@safeCreatooor/4.ViewNewSafe';
import {useAddressBook, Step, AddressBookContextApp} from '@addressBook/useAddressBook';

import type {ReactElement} from 'react';

function AddressBook(): ReactElement {
	const {currentStep, set_currentStep} = useAddressBook();

	const onSendToken = useCallback((): void => {
		// set_currentStep(Step.CONFIRMATION);
		document?.getElementById('tldr')?.scrollIntoView({behavior: 'smooth', block: 'center'});
	}, [set_currentStep]);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'}>
					{'SmolSend'}
				</h1>
				<b className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'Save, manage, and quickly send tokens to your frequently used addresses.'}
				</b>
			</div>

			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.BOOK);
					document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}} />

			<div
				id={'book'}
				className={`overflow-hidden pt-10 transition-opacity${[Step.BOOK, Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewAddressBookSection onProceed={onSendToken} />
			</div>

			<div
				id={'confirmation'}
				className={`pt-10 transition-opacity ${[Step.CONFIRMATION].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewNewSafe owners={[]} threshold={1} />
			</div>

		</div>
	);
}

export default function AddressBookWrapper(): ReactElement {
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
				<AddressBook />
			</>
		</AddressBookContextApp>
	);
}

