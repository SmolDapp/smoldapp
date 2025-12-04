import {Fragment, useRef} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {IconCircleCross} from '@icons/IconCircleCross';
import {ImageWithFallback} from '@common/ImageWithFallback';
import {TokenListAddBox} from '@common/TokenList/TokenListAddBox';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TToken, TTokenList} from '@utils/types/types';

type TTokenListHandlerPopover = {
	lists: TTokenList[];
	onAddTokenList: (list: TTokenList) => void;
	onAddToken: (token: TToken) => void;
	isOpen: boolean;
	set_isOpen: Dispatch<SetStateAction<boolean>>;
};
function TokenListHandlerPopover({
	lists,
	onAddTokenList,
	onAddToken,
	isOpen,
	set_isOpen
}: TTokenListHandlerPopover): React.ReactElement {
	const cancelButtonRef = useRef(null);

	return (
		<Transition.Root
			show={isOpen}
			as={Fragment}>
			<Dialog
				as={'div'}
				className={'relative z-50'}
				initialFocus={cancelButtonRef}
				onClose={set_isOpen}>
				<Transition.Child
					as={Fragment}
					enter={'ease-out duration-300'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'ease-in duration-200'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'fixed inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity'} />
				</Transition.Child>

				<div className={'fixed inset-0 z-10 w-screen overflow-y-auto'}>
					<div className={'flex min-h-full items-end justify-center p-4 text-center sm:items-start sm:p-0'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
							enterTo={'opacity-100 translate-y-0 sm:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
							leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
							<Dialog.Panel
								className={
									'relative rounded-lg bg-white pb-4 pt-5 text-left shadow-xl transition-all sm:my-24 sm:w-full sm:max-w-2xl'
								}>
								<div
									onClick={(): void => set_isOpen(false)}
									className={'absolute -right-2 -top-2'}>
									<div className={'group cursor-pointer rounded-full bg-white'}>
										<IconCircleCross
											className={
												'size-6 text-neutral-600 transition-colors hover:text-neutral-900'
											}
											aria-hidden={'true'}
										/>
									</div>
								</div>

								<div className={'sm:flex sm:items-start'}>
									<div className={'mt-3 text-center sm:mt-0 sm:text-left'}>
										<Dialog.Title
											as={'h3'}
											className={
												'px-4 text-base font-semibold leading-6 text-neutral-900 md:px-6'
											}>
											{'Manage your list of tokens'}
										</Dialog.Title>

										<TokenListAddBox
											onAddTokenList={onAddTokenList}
											onAddToken={onAddToken}
										/>

										<div
											className={
												'scrollbar-show mt-2 max-h-[280px] overflow-y-scroll md:max-h-[420px]'
											}>
											{lists
												.filter((eachList: TTokenList): boolean => eachList.tokens.length > 0)
												.map(
													(eachList: TTokenList): ReactElement => (
														<div
															key={eachList.name}
															className={
																'relative flex w-full p-4 transition-colors hover:bg-neutral-50 md:px-6'
															}>
															<div
																className={
																	'grid w-full grid-cols-12 items-center gap-4'
																}>
																<div
																	className={
																		'col-span-12 flex flex-row items-center space-x-6 md:col-span-8'
																	}>
																	<div
																		className={
																			'rounded-full border border-neutral-100'
																		}>
																		<ImageWithFallback
																			alt={eachList.name}
																			width={40}
																			height={40}
																			quality={90}
																			className={'w-10 min-w-[40px]'}
																			unoptimized
																			src={eachList.logoURI || ''}
																		/>
																	</div>
																	<div className={'text-left'}>
																		<p className={'text-sm'}>
																			<span className={'font-medium'}>
																				{eachList.name}
																			</span>
																		</p>
																		<span
																			className={
																				'font-number mt-2 block !font-mono text-xxs text-neutral-600 transition-colors md:text-xs'
																			}>
																			{eachList.uri ? (
																				<a
																					href={eachList.uri}
																					target={'_blank'}
																					rel={'noreferrer'}
																					className={
																						'cursor-alias font-mono hover:text-neutral-900 hover:underline'
																					}>
																					{eachList.uri.split('/').pop() ||
																						'Your list'}
																				</a>
																			) : (
																				'Your list'
																			)}
																			{` • ${eachList.tokens.length} ${
																				eachList.tokens.length > 1
																					? 'tokens'
																					: 'token'
																			}`}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													)
												)}
										</div>
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

export {TokenListHandlerPopover};
