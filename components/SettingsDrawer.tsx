import {Fragment} from 'react';
import TokenListsSelector from 'components/TokenListsSelector';
import {Dialog, Transition} from '@headlessui/react';

import CustomTokenSelector from './CustomTokenSelector';

import type {Dispatch, ReactElement, SetStateAction} from 'react';

export default function SettingsDrawer({isDrawerOpen, set_isDrawerOpen}: {
	isDrawerOpen: boolean;
	set_isDrawerOpen: Dispatch<SetStateAction<boolean>>
}): ReactElement {
	return (
		<Transition.Root show={isDrawerOpen} as={Fragment}>
			<Dialog
				as={'div'}
				className={'relative z-10'}
				onClose={set_isDrawerOpen}>
				<Transition.Child
					as={Fragment}
					enter={'transform transition ease-in-out duration-500 sm:duration-700'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-10'}
					leave={'transform transition ease-in-out duration-500 sm:duration-700'}
					leaveFrom={'opacity-10'}
					leaveTo={'opacity-0'}>
					<div className={'fixed inset-0 bg-black'} />
				</Transition.Child>

				<div className={'fixed inset-0 overflow-hidden'}>
					<div className={'absolute inset-0 overflow-hidden'}>
						<div className={'pointer-events-none fixed bottom-0 top-14 right-0 flex max-w-full'}>
							<Transition.Child
								as={Fragment}
								enter={'transform transition ease-in-out duration-500 sm:duration-700'}
								enterFrom={'translate-x-full'}
								enterTo={'translate-x-0'}
								leave={'transform transition ease-in-out duration-500 sm:duration-700'}
								leaveFrom={'translate-x-0'}
								leaveTo={'translate-x-full'}>
								<Dialog.Panel className={'pointer-events-auto w-screen md:max-w-lg'}>
									<div className={'box-0 flex h-full flex-col overflow-y-scroll !rounded-none'}>
										<div className={'mb-4 border-b border-neutral-200 pb-4'}>
											<div>
												<section aria-label={'tokenLists'} className={'w-full p-6 pt-4'}>
													<b>{'Select your tokenlists or include individual tokens'}</b>
													<p className={'text-xs text-neutral-500'}>
														{'Token Lists is a community-led initiative to improve discoverability, reputation and trust in ERC20 token lists in a manner that is inclusive, transparent, and decentralized. This regroups popular tokens for easy access.'}
													</p>
													<div className={'mt-6'}>
														<CustomTokenSelector />
													</div>
												</section>
											</div>
										</div>
										<div>
											<div>
												<section aria-label={'tokenLists'} className={'w-full p-6 pt-4'}>
													<b>{'Select your tokenlists or include individual tokens'}</b>
													<p className={'text-xs text-neutral-500'}>
														{'Token Lists is a community-led initiative to improve discoverability, reputation and trust in ERC20 token lists in a manner that is inclusive, transparent, and decentralized. This regroups popular tokens for easy access.'}
													</p>
													<div className={'mt-6'}>
														<TokenListsSelector />
													</div>
												</section>
											</div>
										</div>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
