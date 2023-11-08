import {SmallCardWithIcon} from './CardWithIcon';

import type {Dispatch, ReactElement, SetStateAction} from 'react';

type TPopoverSettingsItemTestnets = {
	isSelected: boolean;
	set_isSelected: Dispatch<SetStateAction<boolean>>;
};
export function PopoverSettingsItemTestnets(props: TPopoverSettingsItemTestnets): ReactElement {
	return (
		<div aria-label={'testnets'}>
			<div>
				<h6 className={'text-base font-semibold leading-6 text-neutral-900'}>{'Testnets'}</h6>
				<small>
					{
						'The testnets option will display the testnets in the list of available networks, allowing you to deploy a safe on a testnet.'
					}
				</small>
			</div>

			<div className={'mt-2 flex gap-2 md:gap-4'}>
				<SmallCardWithIcon
					isSelected={!props.isSelected}
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							height={'1em'}
							viewBox={'0 0 640 640'}>
							<path
								d={
									'M5.1 9.2C13.3-1.2 28.4-3.1 38.8 5.1C100.5 53.5 162.3 101.9 224 150.3c0-34.1 0-68.2 0-102.3c-2.7 0-5.3 0-8 0c-13.3 0-24-10.7-24-24s10.7-24 24-24c13.3 0 26.7 0 40 0c42.7 0 85.3 0 128 0c13.3 0 26.7 0 40 0c13.3 0 24 10.7 24 24s-10.7 24-24 24c-2.7 0-5.3 0-8 0c0 49.6 0 99.2 0 148.8c0 11.8 3.3 23.5 9.5 33.5c30.8 50.1 61.7 100.3 92.5 150.4c37.6 29.5 75.2 58.9 112.8 88.4c10.4 8.2 12.3 23.3 4.1 33.7s-23.3 12.3-33.7 4.1C403.8 352.2 206.5 197.6 9.2 42.9C-1.2 34.7-3.1 19.6 5.1 9.2zM96 442.6c0-12.8 3.6-25.4 10.3-36.4c31.3-50.8 62.6-101.7 93.9-152.5c12.6 10 25.3 19.9 37.9 29.9c-7.5 12.1-14.9 24.3-22.4 36.4c22.9 0 45.7 0 68.6 0c76.3 60.1 152.6 120.2 228.8 180.3c-11 7.4-24.3 11.7-38.5 11.7c-103.1 0-206.1 0-309.2 0C127.1 512 96 480.9 96 442.6zM272 48l0 139.9c45.7 35.8 91.4 71.7 137.1 107.5c-8.2-13.3-16.4-26.6-24.5-39.9c-10.9-17.7-16.6-38-16.6-58.7c0-49.6 0-99.2 0-148.8c-32 0-64 0-96 0z'
								}
								fill={'currentColor'}
							/>
						</svg>
					}
					label={'Hide testnets'}
					onClick={(): void => props.set_isSelected(false)}
				/>

				<SmallCardWithIcon
					isSelected={props.isSelected}
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							height={'1em'}
							viewBox={'0 0 448 512'}>
							<path
								d={
									'M176 196.8c0 20.7-5.8 41-16.6 58.7L119.7 320H328.3l-39.7-64.5c-10.9-17.7-16.6-38-16.6-58.7V48H176V196.8zM320 48V196.8c0 11.8 3.3 23.5 9.5 33.5L437.7 406.2c6.7 10.9 10.3 23.5 10.3 36.4c0 38.3-31.1 69.4-69.4 69.4H69.4C31.1 512 0 480.9 0 442.6c0-12.8 3.6-25.4 10.3-36.4L118.5 230.4c6.2-10.1 9.5-21.7 9.5-33.5V48h-8c-13.3 0-24-10.7-24-24s10.7-24 24-24h40H288h40c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8z'
								}
								fill={'currentColor'}
							/>
						</svg>
					}
					label={'Display testnets'}
					onClick={(): void => props.set_isSelected(true)}
				/>
			</div>
		</div>
	);
}
