import React from 'react';
import {useSelected} from 'contexts/useSelected';
import {useWallet} from 'contexts/useWallet';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {ReactElement} from 'react';

function	ViewTLDR(): ReactElement {
	const	{selected, amounts, destinationAddress, amountToDonate} = useSelected();
	const	{balances} = useWallet();
	const	chain = useChain();

	return (
		<section id={'review'} className={'pt-4 pb-10'}>
			<div className={'box-100 relative grid w-full overflow-hidden !rounded-b-none p-4 md:p-6'}>
				<div className={'w-full md:w-3/4'}>
					<a href={'#review'}>
						<b>{'TLDR;'}</b>
					</a>
					<p className={'text-sm text-neutral-500'}>
						{'Here is a quick summary of the upcoming transactions.'}
					</p>
				</div>
				<div className={'mt-6 flex flex-col space-y-4 font-mono text-sm md:space-y-2'}>

					<div className={'mb-2 hidden w-full grid-cols-11 border-b border-neutral-300 pb-2 text-sm tabular-nums text-neutral-500 md:grid'}>
						<p className={'col-span-11 flex items-center justify-between md:col-span-4'}>
							<span className={'font-number'}>{'Token'}</span>
							&nbsp;
							<span className={'font-number'}>{'Amount'}</span>
						</p>
						<p className={'text-center'}>
							{''}
						</p>
						<p className={'col-span-11 text-end md:col-span-6'}>
							<span className={'font-number text-sm'}>
								{'Recipient Address'}
							</span>
						</p>
					</div>

					{selected.filter((token): boolean => toAddress(token) !== ETH_TOKEN_ADDRESS).map((token, index): JSX.Element => {
						return (
							<div key={index} className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
								<p className={'col-span-11 flex items-center justify-between md:col-span-4'}>
									<span className={'font-number'}>{balances[toAddress(token)]?.symbol || 'Tokens'}</span>
									&nbsp;
									<span className={'font-number'}>{amounts[toAddress(token)]?.normalized || 0}</span>
								</p>
								<p className={'hidden text-center md:block'}>
									{'→'}
								</p>
								<p className={'col-span-10 text-end md:col-span-6'}>
									<span className={'font-number hidden text-sm md:inline'}>
										{toAddress(destinationAddress).replace(/(.{4})/g, '$1 ')}
									</span>
									<span className={'font-number inline text-xs md:hidden'}>
										{toAddress(destinationAddress)}
									</span>
								</p>
							</div>
						);
					})}
					{selected.includes(ETH_TOKEN_ADDRESS) && amounts[ETH_TOKEN_ADDRESS]?.raw.gt(0) ? (
						<div className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
							<p className={'col-span-11 flex items-center justify-between md:col-span-4'}>
								<span className={'font-number'}>{chain.getCurrent()?.coin || 'ETH'}</span>
							&nbsp;
								<span className={'font-number'}>{`~ ${Number(amounts[ETH_TOKEN_ADDRESS]?.normalized || 0) - Number(amountToDonate?.normalized || 0)}`}</span>
							</p>
							<p className={'hidden text-center md:block'}>
								{'→'}
							</p>
							<p className={'col-span-10 text-end md:col-span-6'}>
								<span className={'font-number hidden text-sm md:inline'}>
									{toAddress(destinationAddress).replace(/(.{4})/g, '$1 ')}
								</span>
								<span className={'font-number inline text-xs md:hidden'}>
									{toAddress(destinationAddress)}
								</span>
							</p>
						</div>
					) : null}
					{amountToDonate.raw.gt(0) ? (
						<div className={'grid w-full grid-cols-11 text-sm tabular-nums'}>
							<p className={'col-span-11 flex items-center justify-between md:col-span-4'}>
								<span className={'font-number'}>{`Donate ${chain.getCurrent()?.coin || 'ETH'}`}</span>
								&nbsp;
								<span className={'font-number'}>{amountToDonate?.normalized || 0}</span>
							</p>
							<p className={'hidden text-center md:block'}>
								{'→'}
							</p>
							<p className={'col-span-10 text-end md:col-span-6'}>
								<span className={'font-number hidden text-sm md:inline'}>
									{toAddress(process.env.RECEIVER_ADDRESS).replace(/(.{4})/g, '$1 ')}
								</span>
								<span className={'font-number inline text-xs md:hidden'}>
									{toAddress(process.env.RECEIVER_ADDRESS)}
								</span>
							</p>
						</div>
					) : null}

				</div>
			</div>
		</section>
	);
}
export default ViewTLDR;
