import {SmallCardWithIcon} from './CardWithIcon';

import type {Dispatch, ReactElement, SetStateAction} from 'react';

type TPopoverSettingsItemExpert = {
	isSelected: boolean;
	set_isSelected: Dispatch<SetStateAction<boolean>>;
};
export function PopoverSettingsItemExpert(props: TPopoverSettingsItemExpert): ReactElement {
	return (
		<div aria-label={'expert-mode'}>
			<div>
				<h6 className={'text-base font-semibold leading-6 text-neutral-900'}>{'Expert mode'}</h6>
				<small>
					{
						'The expert mode allow you to deploy a safe with custom parameters, like the Seed and the Factory address.'
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
							viewBox={'0 0 512 512'}>
							<path
								d={
									'M138.9 22.9L256 192H400V152c0-30.9 25.1-56 56-56h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H456c-4.4 0-8 3.6-8 8v40 32c0 28-6.1 55.6-17.7 81.1c-11.6 25.5-28.6 48.4-49.5 67.5c-21 19.1-45.6 34-72.5 44.1S252.8 432 224 432s-57.4-5.2-84.3-15.3s-51.5-25-72.5-44.1c-21-19.1-37.9-42-49.5-67.5C6.1 279.6 0 252 0 224V192H.1C2.7 117.9 41.3 52.9 99 14.1c13.3-8.9 30.8-4.3 39.9 8.8zM80 416a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm240 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM56.1 272c1.5 4.5 3.3 8.9 5.3 13.2c8.8 19.4 21.8 37.1 38.2 51.9s35.7 26.6 57.1 34.7s44.2 12.2 67.4 12.2s46-4.1 67.4-12.2s40.8-19.8 57.1-34.7s29.3-32.5 38.2-51.9c2-4.3 3.7-8.8 5.3-13.2c3.6-10.4 6-21.1 7.2-32H48.9c1.2 10.9 3.6 21.6 7.2 32z'
								}
								fill={'currentColor'}
							/>
						</svg>
					}
					label={'Baby mode'}
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
									'M89.3 156.3C113 115 143.2 77 170.5 50.4c18.7 18.7 40.9 47.2 60.1 71.7c3.8 4.8 7.4 9.5 10.9 13.9c4.6 5.8 11.7 9.2 19.1 9.1s14.4-3.6 18.9-9.5c3.3-4.3 7.7-10.8 12.3-17.4c2.6-3.8 5.3-7.6 7.8-11.2c5.6-7.9 10.5-14.5 14.4-19.1c20 20.8 41 53 57.4 88.4c17.7 38.2 28.6 77 28.6 106.3c0 103-78.8 181.4-176 181.4c-98.3 0-176-78.4-176-181.4c0-37.5 16.2-82.4 41.3-126.2zM199.5 11.6C183.3-3.8 158-3.9 141.8 11.5c-32 30.1-67 73.6-94.1 121C20.7 179.5 0 233 0 282.6C0 410.9 98.1 512 224 512c124.6 0 224-100.9 224-229.4c0-39.1-13.9-85.2-33.1-126.5C395.7 114.6 369.8 74.9 343 49c-16.3-15.8-42-15.8-58.3-.1c-7.9 7.6-17 20-24.3 30.3l-1.1 1.6C240.6 57 218.4 29.5 199.5 11.6zM225.7 416c25.3 0 47.7-7 68.8-21c42.1-29.4 53.4-88.2 28.1-134.4c-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5c-16.5-21-46-58.5-62.8-79.8c-6.3-8-18.3-8.1-24.7-.1c-33.8 42.5-50.8 69.3-50.8 99.4C112 375.4 162.6 416 225.7 416z'
								}
								fill={'currentColor'}
							/>
						</svg>
					}
					label={'Expert mode'}
					onClick={(): void => props.set_isSelected(true)}
				/>
			</div>
		</div>
	);
}
