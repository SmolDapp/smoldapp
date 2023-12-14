import {Fragment, useState} from 'react';
import Confetti from 'react-dom-confetti';
import {Button} from 'components/Primitives/Button';
import Lottie from 'lottie-react';
import {Dialog, Transition} from '@headlessui/react';
import {useUpdateEffect} from '@react-hookz/web';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import SuccessAnimation from '../../../utils/lottie/success.json';

import type {ReactElement} from 'react';

function SuccessModal({isOpen, onClose}: {isOpen: boolean; onClose: VoidFunction}): ReactElement {
	const [shouldTriggerConfettis, set_shouldTriggerConfettis] = useState(false);

	useUpdateEffect((): void => {
		if (isOpen) {
			setTimeout((): void => set_shouldTriggerConfettis(true), 300);
		} else {
			set_shouldTriggerConfettis(false);
		}
	}, [isOpen]);

	return (
		<Transition.Root
			show={isOpen}
			as={Fragment}>
			<Dialog
				as={'div'}
				className={'relative z-[1000]'}
				onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter={'ease-out duration-300'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'ease-in duration-200'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'bg-primary-900/40 fixed inset-0 backdrop-blur-sm transition-opacity'} />
				</Transition.Child>

				<div className={'fixed inset-0 z-[1001] flex h-screen w-screen items-center justify-center'}>
					<Confetti
						active={shouldTriggerConfettis}
						config={{spread: 500}}
					/>
				</div>
				<div className={'fixed inset-0 z-[1001] w-screen overflow-y-auto'}>
					<div className={'flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
							enterTo={'opacity-100 translate-y-0 sm:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
							leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
							<Dialog.Panel
								className={cl(
									'relative overflow-hidden rounded-md !bg-neutral-200 !p-10 transition-all',
									'sm:my-8 sm:w-full sm:max-w-2xl sm:p-6'
								)}>
								<div>
									<div className={'text-center'}>
										<Dialog.Title
											as={'h3'}
											className={'text-primary-900 text-3xl font-bold leading-6'}>
											{'You are done!'}
										</Dialog.Title>
										<div className={'mt-6'}>
											<p className={'text-neutral-900/80'}>
												{
													'We are proud of you Anon, you did your part in the future of finance.'
												}
											</p>
										</div>
									</div>
								</div>
								<div className={'my-10 flex items-center justify-center'}>
									<div className={'h-52 w-52'}>
										<Lottie
											loop={false}
											animationData={SuccessAnimation}
										/>
									</div>
								</div>
								<div className={'flex items-center justify-center text-center'}>
									<Button onClick={onClose}>{'Go back'}</Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
export {SuccessModal};
