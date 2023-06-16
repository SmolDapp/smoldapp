import React from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconSpinner from 'components/icons/IconSpinner';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TSelectedStatus} from '@migratooor/useMigratooor';

type TApprovalWizardItemProps = {
	token: {
		address: TAddress,
		destination: TAddress,
		symbol: string,
		amount: string | number
	},
	executeStatus: TSelectedStatus,
	prefix?: string
}
function	ApprovalWizardItem({
	token,
	executeStatus,
	prefix = 'Send'
}: TApprovalWizardItemProps): ReactElement {
	function	renderExecuteIndication(): ReactElement {
		if (executeStatus === 'success') {
			return (<IconCheck className={'h-4 w-4 text-[#16a34a]'} />);
		}
		if (executeStatus === 'pending') {
			return <IconSpinner />;
		}
		if (executeStatus === 'error') {
			return (<IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />);
		}
		return (<div className={'h-4 w-4 rounded-full bg-neutral-300'} />);
	}

	return (
		<div
			className={'group mb-2 flex w-full flex-col justify-center border-b border-neutral-200 pb-3 pt-1 transition-colors'}>
			<div className={'flex flex-row items-center space-x-4'}>
				<div className={'flex flex-row items-center space-x-2'}>
					{renderExecuteIndication()}
					<small>
						{`${prefix} `}
						<b>{`${token?.amount} ${token?.symbol}`}</b>
						{` to ${token?.destination}`}
					</small>
				</div>
			</div>
		</div>
	);
}

export default ApprovalWizardItem;
