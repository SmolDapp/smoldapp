import {Fragment, useState} from 'react';
import {usePopper} from 'react-popper';
import {useRouter} from 'next/router';
import IconBug from 'components/icons/IconBug';
import html2canvas from 'html2canvas';
import {useAccount} from 'wagmi';
import axios from 'axios';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {toAddress, truncateHex} from '@builtbymom/web3/utils';
import {Popover as PopoverHeadlessUI, Portal, Transition} from '@headlessui/react';
import {useLocalStorageValue} from '@react-hookz/web';

import type {ReactElement} from 'react';

type TRequestType = 'bug' | 'feature';

export const getPosition = (element: HTMLElement): {x: number; y: number} => {
	const currentTop = window.pageXOffset;
	const currentLeft = window.pageYOffset;

	if (element) {
		if (element.getBoundingClientRect) {
			const {top, left} = element.getBoundingClientRect();
			return {x: left + currentLeft, y: top + currentTop};
		}
		// polyfill
		let xPosition = 0;
		let yPosition = 0;

		while (element) {
			xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
			yPosition += element.offsetTop - element.scrollTop + element.clientTop;
			if (element.offsetParent) {
				element = element.offsetParent as HTMLElement;
			}
		}
		return {x: xPosition, y: yPosition};
	}

	return {x: 0, y: 0};
};

export function FeebackPopover(): ReactElement {
	const [referenceElement, set_referenceElement] = useState<HTMLButtonElement | null>(null);
	const [popperElement, set_popperElement] = useState<HTMLDivElement | null>(null);
	const [type, set_type] = useState<TRequestType>('bug');
	const [telegramHandle, set_telegramHandle] = useState<string>();
	const [isSubmitDisabled, set_isSubmitDisabled] = useState<boolean>(false);
	const [description, set_description] = useState<string>();
	const {address, chainID, ens, lensProtocolHandle, isWalletLedger, isWalletSafe} = useWeb3();
	const {connector} = useAccount();
	const router = useRouter();
	const {value: hasPopover, set: set_hasPopover} = useLocalStorageValue<boolean>('smoldapp/feedback-popover');
	const {styles, attributes} = usePopper(referenceElement, popperElement, {
		modifiers: [{name: 'offset', options: {offset: [0, 10]}}],
		placement: 'bottom-end'
	});

	async function onSubmit(closeCallback: VoidFunction): Promise<void> {
		set_isSubmitDisabled(true);

		const {body} = document;
		if (!body) {
			set_isSubmitDisabled(false);
			closeCallback();
			return;
		}
		const canvas = await html2canvas(body, {
			allowTaint: true,
			width: window.innerWidth,
			height: window.innerHeight,
			scrollX: window.pageXOffset,
			scrollY: window.pageYOffset,
			x: window.pageXOffset,
			y: window.pageYOffset + window.scrollY,
			ignoreElements: (element): boolean => element.id === 'headlessui-portal-root'
		});
		const reporter = ens || lensProtocolHandle || (address ? truncateHex(toAddress(address), 5) : '');
		const formData = new FormData();
		const blob = await new Promise<Blob | null>((resolve): void => {
			canvas.toBlob((blob): void => resolve(blob));
		});
		if (blob) {
			formData.append('screenshot', blob);
		}
		formData.append(
			'messages',
			[
				`*🔵 New ${type} submitted*`,
				`\n*Telegram:* ${telegramHandle}`,
				description,
				'\n*👀 - Info:*',
				reporter
					? `\t\t\t\tFrom: [${reporter}](https://etherscan.io/address/${address})`
					: '\t\t\t\tFrom: [wallet-not-connected]',
				`\t\t\t\tChain: ${chainID}`,
				`\t\t\t\tWallet: ${isWalletLedger ? 'ledger' : isWalletSafe ? 'safe' : connector?.id || 'Unknown'}`,
				`\t\t\t\tOrigin: [${router.asPath}](https://smold.app/${router.asPath})`
			].join('\n')
		);
		try {
			await axios.post('/api/report', formData, {
				headers: {'Content-Type': 'multipart/form-data'}
			});
			closeCallback();
			set_isSubmitDisabled(false);
		} catch (error) {
			console.error(error);
			set_isSubmitDisabled(false);
		}
	}

	return (
		<Portal>
			<PopoverHeadlessUI className={'relative z-50'}>
				<PopoverHeadlessUI.Button
					className={
						'bg-primary-500 fixed bottom-5 right-5 flex size-10 items-center justify-center rounded-full'
					}
					ref={set_referenceElement}>
					<IconBug className={'size-4 text-neutral-0'} />
				</PopoverHeadlessUI.Button>
				<PopoverHeadlessUI.Overlay className={'fixed inset-0 bg-black opacity-30'} />
				<Transition
					as={Fragment}
					enter={'transition ease-out duration-200'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'transition ease-in duration-150'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<PopoverHeadlessUI.Panel
						ref={set_popperElement}
						style={styles.popper}
						{...attributes.popper}>
						{({close}): ReactElement => (
							<div
								className={
									'flex flex-col space-y-2 overflow-hidden rounded-md border border-neutral-300/50 bg-neutral-0 p-6 pb-3 shadow shadow-transparent'
								}>
								<select
									name={'type'}
									id={'type'}
									className={
										'hover:bg-neutral-100/40 cursor-pointer border border-neutral-300/50 bg-transparent text-xs transition-colors focus:border-neutral-300/50'
									}
									onChange={({target: {value}}): void => {
										if (isRequestTypeKnown(value)) {
											set_type(value);
										}
									}}>
									<option value={'bug'}>{'Bug'}</option>
									<option value={'feature'}>{'Feature'}</option>
								</select>
								<textarea
									id={'description'}
									cols={30}
									rows={4}
									className={
										'hover:bg-neutral-100/40 resize-none border border-neutral-300/50 bg-transparent p-2 text-xs transition-colors focus:border-neutral-300/50'
									}
									onChange={({target: {value}}): void => set_description(value)}
									placeholder={`Describe the ${type} in detail`}
								/>
								<input
									id={'telegramHandle'}
									className={
										'hover:bg-neutral-100/40 resize-none border border-neutral-300/50 bg-transparent p-2 text-xs transition-colors focus:border-neutral-300/50'
									}
									onChange={({target: {value}}): void => set_telegramHandle(value)}
									placeholder={'Your telegram handle'}
								/>
								<button
									disabled={!description || description.length < 10 || isSubmitDisabled}
									className={
										'relative h-8 cursor-pointer items-center justify-center border border-transparent bg-neutral-900 px-2 text-xs text-neutral-0 transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40'
									}
									onClick={async (): Promise<void> => onSubmit(close)}>
									{'Submit'}
								</button>
								<label className={'max-w-xs items-center justify-end pt-2'}>
									<p className={'text-right text-xs italic text-neutral-400/60'}>
										{'Address and screenshot of page will be attached'}
									</p>
									<p className={'text-right text-xs italic text-neutral-400/60'}>
										{'For internal use only'}
									</p>
								</label>
								<label className={'flex cursor-pointer items-center justify-end'}>
									<button
										className={
											'text-right text-xs text-neutral-300 underline transition-colors hover:text-neutral-400'
										}
										onClick={(): void => set_hasPopover(!hasPopover)}>
										{'Hide me forever'}
									</button>
								</label>
							</div>
						)}
					</PopoverHeadlessUI.Panel>
				</Transition>
			</PopoverHeadlessUI>
		</Portal>
	);
}

function isRequestTypeKnown(type: string): type is TRequestType {
	return type === 'bug' || type === 'feature';
}
