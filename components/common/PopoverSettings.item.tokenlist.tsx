import {useTokenListModal} from 'contexts/useTokenListModal';

import {SmallCardWithIcon} from './CardWithIcon';

import type {ReactElement} from 'react';

export function PopoverSettingsItemTokenList(): ReactElement {
	const {openTokenListModal} = useTokenListModal();

	return (
		<div aria-label={'tokenlist'}>
			<div>
				<h6 className={'text-base font-semibold leading-6 text-neutral-900'}>{'Tokenlist'}</h6>
				<small>
					{
						"Need more tokens? Add a single token via it's address, or add a custom tokenList in a quick and easy way."
					}
				</small>
			</div>

			<div className={'mt-2 flex gap-2 md:gap-4'}>
				<SmallCardWithIcon
					isSelected={false}
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							height={'16'}
							width={'16'}
							viewBox={'0 0 512 512'}>
							<path
								d={
									'M153.8 72.1c8.9-9.9 8.1-25-1.8-33.9s-25-8.1-33.9 1.8L63.1 101.1 41 79C31.6 69.7 16.4 69.7 7 79s-9.4 24.6 0 33.9l40 40c4.7 4.7 11 7.2 17.6 7s12.8-3 17.2-7.9l72-80zm0 160c8.9-9.9 8.1-25-1.8-33.9s-25-8.1-33.9 1.8L63.1 261.1 41 239c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l40 40c4.7 4.7 11 7.2 17.6 7s12.8-3 17.2-7.9l72-80zM216 120H488c13.3 0 24-10.7 24-24s-10.7-24-24-24H216c-13.3 0-24 10.7-24 24s10.7 24 24 24zM192 256c0 13.3 10.7 24 24 24H488c13.3 0 24-10.7 24-24s-10.7-24-24-24H216c-13.3 0-24 10.7-24 24zM160 416c0 13.3 10.7 24 24 24H488c13.3 0 24-10.7 24-24s-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm-64 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z'
								}
								fill={'currentColor'}
							/>
						</svg>
					}
					label={'Update TokenLists'}
					onClick={(): void => openTokenListModal()}
				/>
			</div>
		</div>
	);
}
