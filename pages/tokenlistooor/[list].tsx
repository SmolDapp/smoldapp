import React, {useMemo, useState} from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {motion} from 'framer-motion';
import {MigratooorContextApp} from '@migratooor/useMigratooor';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconGithub from '@yearn-finance/web-lib/icons/IconSocialGithub';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {Variants} from 'framer-motion';
import type {GetServerSidePropsResult, NextPageContext} from 'next';
import type {TTokenListItem} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

const variants = {
	enter: (i: number): unknown => ({
		y: 0,
		opacity: 1,
		transition: {
			delay: i * 0.04,
			duration: 0.5,
			ease: 'linear'
		}
	}),
	initial: {y: 60, opacity: 0}
};


function TokenListHero({list}: {list: TTokenListItem}): ReactElement {
	const fileName = (list.URI || '').replace('https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/', '');

	return (
		<div className={'relative isolate overflow-hidden bg-neutral-0'}>
			<div className={'mx-auto grid max-w-4xl grid-cols-1 pb-0 pt-10 md:grid-cols-1 md:pb-10 md:pt-20'}>
				<div className={'relative w-full'}>
					<div className={'absolute -top-10 left-0'}>
						<Link href={'/tokenlistooor'}>
							<p className={'text-xs text-neutral-400 transition-all hover:text-neutral-900 hover:underline'}>{'◁ Back'}</p>
						</Link>
					</div>
					<div className={'absolute -top-10 right-0'}>
						<div className={'rounded-default w-full border border-dashed border-neutral-300 bg-neutral-0 px-3 py-1 text-xs leading-6 text-neutral-500 md:text-sm'}>
							{'Last update: '}
							<span className={'inline-flex items-center pl-2 font-bold text-neutral-900'}>
								<span>{list.timestamp}</span>
							</span>
						</div>
					</div>
					<div>
						<ImageWithFallback
							unoptimized
							src={list.logoURI?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${list.logoURI.replace('ipfs://', '')}` : list.logoURI}
							width={64}
							height={64}
							alt={''} />
					</div>
					<h1 className={'mt-1 text-3xl font-bold tracking-tight text-neutral-900 md:mt-1 md:text-4xl'}>
						{list.name}
					</h1>
					<div className={'mt-4 text-base leading-normal text-neutral-500 md:mt-6 md:text-lg md:leading-8'}>
						{list.description || `A list of token for ${list.name}`}
						<p className={'text-sm'}>
							{'Version: '}{list.version.major}{'.'}{list.version.minor}{'.'}{list.version.patch}
						</p>
					</div>
					<div className={'mt-6 flex items-center gap-x-6 md:mt-10'}>
						<Link href={`https://github.com/SmolDapp/tokenLists/blob/main/lists/${fileName}`} target={'_blank'}>
							<Button>
								<IconGithub className={'mr-4 h-6 w-6'} />
								{'Github'}
							</Button>
						</Link>
						<Link href={list.URI} target={'_blank'}>
							<Button>
								{'Open JSON'}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}



function	List({list}: {list: TTokenListItem}): ReactElement {
	const [currentPage, set_currentPage] = useState(1);
	const [itemsPerPage] = useState(50);
	const [search, set_search] = useState('');

	const searchResult = useMemo((): TTokenListItem['tokens'] => {
		return (
			(list.tokens || [])
				.filter((item): boolean => {
					if (!search) {
						return true;
					}
					return item.name.toLowerCase().startsWith(search.toLowerCase()) || item.symbol.toLowerCase().startsWith(search.toLowerCase()) || item.address.toLowerCase().startsWith(search.toLowerCase());
				})
		);
	}, [list.tokens, search]);

	return (
		<>
			<TokenListHero list={list} />
			<div className={'mx-auto grid w-full max-w-4xl pb-32'}>
				<div className={'flex items-center justify-between py-4 md:pt-0'}>
					<div>
						<input
							className={'rounded-default border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs leading-6 text-neutral-500 md:text-sm'}
							type={'text'}
							placeholder={'Search'}
							onChange={(e): void => set_search(e.target.value)} />
					</div>
				</div>
				<div className={'grid grid-cols-1 gap-1 md:grid-cols-1'}>
					{searchResult
						.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
						.map((item): ReactElement => (
							<motion.div
								key={item.address}
								custom={0}
								initial={'initial'}
								whileInView={'enter'}
								variants={variants as Variants}
								className={'box-0 relative flex w-full p-4 md:p-6'}>
								<div className={'grid w-full grid-cols-12 items-center gap-4'}>
									<div className={'col-span-12 flex flex-row items-center space-x-4 md:col-span-7'}>
										<ImageWithFallback
											alt={`${item.address}_${item.name}_${item.symbol}`}
											width={40}
											height={40}
											quality={90}
											unoptimized
											src={item.logoURI} />
										<div>
											<a
												href={`${getNetwork(item.chainId).blockExplorers}/token/${item.address}`}
												target={'_blank'}
												rel={'noreferrer'}>
												<small className={'font-number block text-xxs text-neutral-700 transition-colors hover:text-neutral-900 hover:underline md:text-xs'}>
													{item.address}
												</small>
											</a>
											<b>{item.name}</b>
										</div>
									</div>
									<div className={'col-span-5 mr-4 md:col-span-2'}>
										<div className={'text-ellipsis'}>
											<small className={'block text-xxs text-neutral-700 md:text-xs'}>
												{'Symbol'}
											</small>
											<b title={item.symbol} className={'block truncate'}>{item.symbol}</b>
										</div>
									</div>
									<div className={'col-span-5 md:col-span-2'}>
										<div>
											<small className={'block text-xxs text-neutral-700 md:text-xs'}>
												{'Chain'}
											</small>
											<b>{getNetwork(item.chainId).name}</b>
										</div>
									</div>
									<div className={'col-span-2 md:col-span-1'}>
										<div>
											<small className={'block text-xxs text-neutral-700 md:text-xs'}>
												{'Decimals'}
											</small>
											<b>{item.decimals}</b>
										</div>
									</div>
								</div>
							</motion.div>
						))}
				</div>
				<div className={'flex items-center justify-between pt-4'}>
					<div>
						<button
							className={'text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline'}
							type={'button'}
							disabled={currentPage === 1}
							onClick={(): void => {
								set_currentPage(currentPage - 1);
								window.scrollTo({top: 0, behavior: 'smooth'});
							}}>
							{'◁ Previous'}
						</button>
					</div>
					<div>
						<span className={'text-xs text-neutral-600'}>
							{`Page ${currentPage} of ${Math.ceil(searchResult.length / itemsPerPage)}`}
						</span>
					</div>
					<div>
						<button
							className={'text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline'}
							type={'button'}
							disabled={currentPage === Math.ceil(searchResult.length / itemsPerPage)}
							onClick={(): void => {
								set_currentPage(currentPage + 1);
								window.scrollTo({top: 0, behavior: 'smooth'});
							}}>
							{'Next ▷'}
						</button>
					</div>

				</div>
			</div>
		</>
	);
}

export default function Wrapper({list}: {list: TTokenListItem}): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={`${list.name} tokenList - SmolDapp`}
					defaultTitle={`${list.name} tokenList - SmolDapp`}
					description={list.description}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/tokenlistooor',
						site_name: `${list.name} tokenList - SmolDapp`,
						title: `${list.name} tokenList - SmolDapp`,
						description: list.description,
						images: [
							{
								url: 'https://smold.app/og_tokenlistooor.png',
								width: 800,
								height: 400,
								alt: 'tokenListooor'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<List list={list} />
			</>
		</MigratooorContextApp>
	);
}


export const getServerSideProps = async (context: NextPageContext): Promise<GetServerSidePropsResult<{list: TTokenListItem}>> => {
	const listID = context?.query?.list;
	if (!listID) {
		return {
			redirect: {
				permanent: false,
				destination: '/tokenlistooor'
			}
		};
	}
	try {
		const listRes = await fetch(`https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${listID}.json`);
		const tokenListResponse = await listRes.json();
		return {props: {list: {...tokenListResponse, URI: `https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${listID}.json`}}};
	} catch (e) {
		console.error(e);
		return {
			redirect: {
				permanent: false,
				destination: '/tokenlistooor'
			}
		};
	}
};
