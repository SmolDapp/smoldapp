import {Fragment, type ReactElement, useEffect, useState} from 'react';
import {IconCross} from '@icons/IconCross';
import * as Dialog from '@radix-ui/react-dialog';
import {CurtainContent} from '@common/Primitives/Curtain';

export function CloseCurtainButton(): ReactElement {
	return (
		<Dialog.Close className={'group -mr-2 -mt-2 p-2'}>
			<IconCross className={'h-4 w-4 text-neutral-600 transition-colors group-hover:text-neutral-900'} />
			<span className={'sr-only'}>{'Close'}</span>
		</Dialog.Close>
	);
}

type TCurtainElement = {
	trigger: ReactElement;
};
export function InfoCurtain(props: TCurtainElement): ReactElement {
	const [isMounted, set_isMounted] = useState<boolean>(false);
	useEffect(() => set_isMounted(true), []);

	if (!isMounted) {
		return <Fragment />;
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger>{props.trigger}</Dialog.Trigger>
			<CurtainContent>
				<aside
					style={{boxShadow: '-8px 0px 20px 0px rgba(36, 40, 51, 0.08)'}}
					className={'flex h-full flex-col bg-neutral-0 p-6'}>
					<div className={'mb-4 flex flex-row items-center justify-between'}>
						<h3 className={'font-bold'}>{'Info'}</h3>
						<CloseCurtainButton />
					</div>
					<div className={'scrollable'}>
						<p className={'whitespace-break-spaces text-neutral-600'}>
							{
								'Sending tokens to another address is a straightforward process on our platform. Please follow these step-by-step instructions to ensure a secure and successful transaction:\n\n Step 1: Log In to Your Account'
							}
						</p>
					</div>
				</aside>
			</CurtainContent>
		</Dialog.Root>
	);
}
