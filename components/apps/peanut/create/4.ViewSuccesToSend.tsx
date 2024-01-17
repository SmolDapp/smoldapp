import {useMemo} from 'react';
import {CHAIN_DETAILS} from '@squirrel-labs/peanut-sdk';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import ViewSectionHeading from '@common/ViewSectionHeading';

import {useCreateLinkPeanut} from './useCreateLinkPeanut';

import type {ReactElement} from 'react';

function ViewSuccesToSend(): ReactElement {
	const {createdLink} = useCreateLinkPeanut();
	const {safeChainID} = useChainID();

	const blockExplorerUrl = useMemo(() => {
		return CHAIN_DETAILS[safeChainID]?.explorers[0].url;
	}, [safeChainID, CHAIN_DETAILS]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'The link has been created!'}
					content={'Click the hash to see the transaction confirmation.'}
				/>
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0 flex flex-col gap-2'}>
					<a
						href={createdLink.link}
						target={'_blank'}
						className={'w-full underline text-sm text-neutral-500 md:w-3/4'}>
						{createdLink.link}
					</a>
					<a
						href={`${blockExplorerUrl}/tx/${createdLink.hash}`}
						target={'_blank'}
						className={'w-full text-sm text-neutral-500 md:w-3/4 underline cursor-pointer'}>
						{createdLink.hash}
					</a>
				</div>
			</div>
		</section>
	);
}
export default ViewSuccesToSend;
