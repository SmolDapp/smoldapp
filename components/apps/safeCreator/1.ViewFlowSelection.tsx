import IconSquarePlus from 'components/icons/IconSquarePlus';
import {Step, useSafeCreator} from '@safeCreatooor/useSafeCreator';
import CardWithIcon from '@common/CardWithIcon';
import ViewSectionHeading from '@common/ViewSectionHeading';

import type {ReactElement} from 'react';

function ViewFlowSelection(): ReactElement {
	const {set_currentStep, selectedFlow, set_selectedFlow} = useSafeCreator();

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
				<ViewSectionHeading
					title={'Do you already have a Safe?'}
					content={'You can take an existing Safe cross chain or deploy a new one.'}
				/>

				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<div className={'grid grid-cols-12 gap-4 md:gap-6'}>
						<div className={'relative col-span-6'}>
							<CardWithIcon
								isSelected={selectedFlow === 'EXISTING'}
								icon={
									<svg
										xmlns={'http://www.w3.org/2000/svg'}
										height={'1em'}
										viewBox={'0 0 512 512'}>
										<path
											d={
												'M64 480H288c17.7 0 32-14.3 32-32V384h32v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v32H64c-17.7 0-32 14.3-32 32V448c0 17.7 14.3 32 32 32zM224 320H448c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H224c-17.7 0-32 14.3-32 32V288c0 17.7 14.3 32 32 32zm-64-32V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z'
											}
											fill={'currentColor'}
										/>
									</svg>
								}
								label={'Clone my existing Safe'}
								onClick={(): void => {
									set_selectedFlow('EXISTING');
									set_currentStep(Step.FLOW_DATA);
									document
										?.getElementById('flowData')
										?.scrollIntoView({behavior: 'smooth', block: 'center'});
								}}
							/>
						</div>
						<div className={'relative col-span-6'}>
							<CardWithIcon
								isSelected={selectedFlow === 'NEW'}
								icon={<IconSquarePlus />}
								label={'Create a new Safe'}
								onClick={(): void => {
									set_selectedFlow('NEW');
									set_currentStep(Step.FLOW_DATA);
									document
										?.getElementById('flowData')
										?.scrollIntoView({behavior: 'smooth', block: 'center'});
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewFlowSelection;
