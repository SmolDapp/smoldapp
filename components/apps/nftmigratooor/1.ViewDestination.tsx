import React, {useState} from 'react';
import AddressInput, {defaultInputAddressLike} from 'components/common/AddressInput';
import {useNFTMigratooor} from '@nftmigratooor/useNFTMigratooor';
import {isZeroAddress, toAddress} from '@utils/tools.address';
import {Button} from '@common/Primitives/Button';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {ReactElement} from 'react';

type TViewDestinationProps = {
	onProceed: () => void;
};
function ViewDestination(props: TViewDestinationProps): ReactElement {
	const {set_destinationAddress} = useNFTMigratooor();
	const [receiver, set_receiver] = useState<TInputAddressLike>(defaultInputAddressLike);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
				<ViewSectionHeading
					title={'Destination'}
					content={
						'Enter the address where you want to migrate your NFTs to. Be sure to double check the address before proceeding.'
					}
				/>
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={
							'grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:w-3/4 md:gap-6'
						}>
						<div className={'col-span-12 md:col-span-9'}>
							<AddressInput
								value={receiver}
								onChangeValue={(e): void => set_receiver(e)}
							/>
						</div>
						<div className={'col-span-12 md:col-span-3'}>
							<Button
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={(): void => {
									set_destinationAddress(toAddress(receiver.address));
									props.onProceed();
								}}
								isDisabled={isZeroAddress(toAddress(receiver.address)) || !receiver.isValid}>
								{'Next'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ViewDestination;
