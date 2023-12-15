import React, {useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {DefaultSeo} from 'next-seo';
import {MigrateContextApp} from 'components/apps/Migrate/useMigrate';
import {Button} from 'components/Primitives/Button';
import {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {SUPPORTED_CHAIN_IDS} from 'utils/constants';
import {motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';
import {IconSocialGithub} from '@yearn-finance/web-lib/icons/IconSocialGithub';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {Variants} from 'framer-motion';
import type {GetServerSidePropsResult, NextPageContext} from 'next';
import type {TTokenListItem} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';
import type {TExtendedChain} from '@yearn-finance/web-lib/utils/wagmi/utils';

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
		<div className={'relative isolate mt-6 overflow-hidden'}>
			<div className={'mx-auto grid max-w-5xl grid-cols-1 pb-0 pt-10 md:grid-cols-1 md:pb-10 md:pt-20'}>
				<div className={'relative w-full'}>
					<div className={'absolute -top-10 left-0'}>
						<Link href={'/tokenlistooor'}>
							<p
								className={
									'text-xs text-neutral-400 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'
								}>
								{'◁ Back'}
							</p>
						</Link>
					</div>
					<div className={'absolute -top-10 right-0'}>
						<div
							className={
								'text-neutral-500 w-full rounded-md border border-dashed border-neutral-300 bg-neutral-0 px-3 py-1 text-xs leading-6 md:text-sm'
							}>
							{'Last update: '}
							<span className={'inline-flex items-center pl-2 font-bold text-neutral-900'}>
								<span>{list.timestamp}</span>
							</span>
						</div>
					</div>
					<div>
						<ImageWithFallback
							unoptimized
							src={
								list.logoURI?.startsWith('ipfs://')
									? `https://ipfs.io/ipfs/${list.logoURI.replace('ipfs://', '')}`
									: list.logoURI
							}
							width={64}
							height={64}
							alt={''}
						/>
					</div>
					<h1 className={'mt-1 text-3xl font-bold tracking-tight text-neutral-900 md:mt-1 md:text-4xl'}>
						{list.name}
					</h1>
					<div className={'text-neutral-500 mt-4 text-base leading-normal md:mt-6 md:text-lg md:leading-8'}>
						{list.description || `A list of token for ${list.name}`}
						<p className={'text-sm'}>
							{'Version: '}
							{list.version.major}
							{'.'}
							{list.version.minor}
							{'.'}
							{list.version.patch}
						</p>
					</div>
					<div className={'mt-6 flex items-center gap-x-6 md:mt-10'}>
						<Link
							href={`https://github.com/SmolDapp/tokenLists/blob/main/lists/${fileName}`}
							target={'_blank'}>
							<Button>
								<IconSocialGithub className={'mr-4 h-6 w-6'} />
								{'Github'}
							</Button>
						</Link>
						<Link
							href={list.URI}
							target={'_blank'}>
							<Button>{'Open JSON'}</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function TokenListItem({item}: {item: TTokenListItem['tokens'][0]}): ReactElement {
	const currentNetwork = useMemo((): TExtendedChain => {
		try {
			return getNetwork(item.chainId);
		} catch (error) {
			return {} as TExtendedChain;
		}
	}, [item.chainId]);

	return (
		<div className={'grid w-full grid-cols-12 items-center gap-4'}>
			<div className={'col-span-12 flex flex-row items-center space-x-6 md:col-span-8'}>
				<ImageWithFallback
					alt={`${item.address}_${item.name}_${item.symbol}`}
					width={40}
					height={40}
					quality={90}
					unoptimized
					src={item.logoURI}
				/>
				<div>
					<p className={'text-sm'}>
						{item.name}
						<span className={'text-xs text-neutral-600'}>{` - (${item.symbol})`}</span>
					</p>
					<span
						className={
							'font-number mt-2 block !font-mono text-xxs text-neutral-600 transition-colors md:text-xs'
						}>
						<a
							href={`${currentNetwork?.blockExplorers?.etherscan?.url || 'https://etherscan.io'}/token/${
								item.address
							}`}
							target={'_blank'}
							rel={'noreferrer'}
							className={'font-mono hover:text-neutral-900 hover:underline'}>
							{item.address}
						</a>
						{` • ${item.decimals} decimals`}
					</span>
				</div>
			</div>

			<div className={'col-span-12 flex justify-end text-right md:col-span-4'}>
				<div>
					<p className={'block text-xxs text-neutral-700 md:text-xs'}>{'Chain'}</p>
					<b>{currentNetwork?.name || `Chain ${item.chainId}`}</b>
				</div>
			</div>
		</div>
	);
}

function TokenListContent({list}: {list: TTokenListItem}): ReactElement {
	const router = useRouter();
	const [currentPage, set_currentPage] = useState(1);
	const [itemsPerPage] = useState(50);
	const [search, set_search] = useState('');
	const [network, set_network] = useState(-1);

	useMountEffect((): void => {
		const {query} = router;
		if (query?.page) {
			set_currentPage(Number(query.page));
		}
		if (query?.search) {
			set_search(String(query.search));
		}
	});

	const availableNetworks = useMemo((): {value: number; label: string}[] => {
		const networks: {value: number; label: string}[] = [];
		([...list.tokens] || []).forEach((item): void => {
			if (!networks.find((network): boolean => network.value === item.chainId)) {
				networks.push({
					value: item.chainId,
					label: (SUPPORTED_CHAIN_IDS[item.chainId] as any) || `Chain #${item.chainId}`
				});
			}
		});
		return networks;
	}, [list.tokens]);

	const searchResult = useMemo((): TTokenListItem['tokens'] => {
		return ([...list.tokens] || [])
			.filter((item): boolean => {
				if (network === -1) {
					return true;
				}
				return item.chainId === network;
			})
			.filter((item): boolean => {
				if (!search) {
					return true;
				}
				return (
					item.name.toLowerCase().startsWith(search.toLowerCase()) ||
					item.symbol.toLowerCase().startsWith(search.toLowerCase()) ||
					item.address.toLowerCase().startsWith(search.toLowerCase())
				);
			});
	}, [list.tokens, search, network]);

	return (
		<div className={'mx-auto grid w-full max-w-5xl pb-32'}>
			<div className={'flex items-center space-x-4 py-4 md:pt-0'}>
				<div>
					<input
						className={
							'text-neutral-500 rounded-md border border-neutral-200 bg-neutral-0 px-3 py-1 text-xs leading-6 md:text-sm'
						}
						type={'text'}
						placeholder={'Search'}
						onChange={(e): void => {
							set_search(e.target.value || '');
							set_currentPage(1);
							if (!e.target.value) {
								const {search, ...queryNoSearch} = router.query;
								search;
								router.push({query: queryNoSearch});
							} else {
								router.push({
									query: {
										...router.query,
										search: e.target.value
									}
								});
							}
						}}
					/>
				</div>
				<div>
					<select
						className={
							'text-neutral-500 rounded-md border border-neutral-200 bg-neutral-0 px-3 py-1 pr-10 text-xs leading-6 md:text-sm'
						}
						value={network}
						onChange={(e): void => {
							set_network(Number(e.target.value));
							set_currentPage(1);
							if (Number(e.target.value) === -1) {
								const {network, ...queryNoNetwork} = router.query;
								network;
								router.push({query: queryNoNetwork});
							} else {
								router.push({
									query: {
										...router.query,
										network: e.target.value
									}
								});
							}
						}}>
						<option value={-1}>{'All Networks'}</option>
						{availableNetworks.map(
							(network): ReactElement => (
								<option
									key={network.value}
									value={network.value}>
									{network.label}
								</option>
							)
						)}
					</select>
				</div>
			</div>
			<div
				className={
					'divide-neutral-100 grid grid-cols-1 divide-y rounded-md border border-neutral-200 bg-neutral-0 md:grid-cols-1'
				}>
				{searchResult.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(
					(item): ReactElement => (
						<motion.div
							key={`${item.address}_${item.chainId}`}
							custom={0}
							initial={'initial'}
							whileInView={'enter'}
							variants={variants as Variants}
							className={'hover:bg-neutral-50/40 relative flex w-full p-4 transition-colors md:p-6'}>
							<TokenListItem item={item} />
						</motion.div>
					)
				)}
			</div>
			<div className={'flex items-center justify-between pt-4'}>
				<div className={'flex flex-row space-x-6'}>
					<div>
						<button
							className={
								'cursor-pointer text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'
							}
							type={'button'}
							disabled={currentPage === 1}
							onClick={(): void => {
								set_currentPage(1);
								window.scrollTo({top: 0, behavior: 'smooth'});
								router.push({
									query: {
										...router.query,
										page: 1
									}
								});
							}}>
							{'◁◁ '}
						</button>
					</div>
					<div>
						<div>
							<button
								className={
									'cursor-pointer text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'
								}
								type={'button'}
								disabled={currentPage === 1}
								onClick={(): void => {
									set_currentPage(currentPage - 1);
									window.scrollTo({top: 0, behavior: 'smooth'});
									router.push({
										query: {
											...router.query,
											page: currentPage - 1
										}
									});
								}}>
								{'◁ Previous'}
							</button>
						</div>
					</div>
				</div>
				<div>
					<span className={'text-xs text-neutral-600'}>
						{`Page ${currentPage} of ${Math.ceil(searchResult.length / itemsPerPage)}`}
					</span>
				</div>
				<div className={'flex flex-row space-x-6'}>
					<div>
						<div>
							<button
								className={
									'text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'
								}
								type={'button'}
								disabled={currentPage === Math.ceil(searchResult.length / itemsPerPage)}
								onClick={(): void => {
									set_currentPage(currentPage + 1);
									window.scrollTo({top: 0, behavior: 'smooth'});
									router.push({
										query: {
											...router.query,
											page: currentPage + 1
										}
									});
								}}>
								{'Next ▷'}
							</button>
						</div>
					</div>
					<div>
						<button
							className={
								'cursor-pointer text-xs text-neutral-600 transition-all hover:text-neutral-900 hover:underline disabled:text-neutral-400/40'
							}
							type={'button'}
							disabled={currentPage === Math.ceil(searchResult.length / itemsPerPage)}
							onClick={(): void => {
								set_currentPage(Math.ceil(searchResult.length / itemsPerPage));
								window.scrollTo({top: 0, behavior: 'smooth'});
								router.push({
									query: {
										...router.query,
										page: Math.ceil(searchResult.length / itemsPerPage)
									}
								});
							}}>
							{' ▷▷'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function List({list}: {list: TTokenListItem}): ReactElement {
	return (
		<>
			<TokenListHero list={list} />
			<TokenListContent list={list} />
		</>
	);
}

export default function Wrapper({list}: {list: TTokenListItem}): ReactElement {
	return (
		<MigrateContextApp>
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
					}}
				/>
				<List list={list} />
			</>
		</MigrateContextApp>
	);
}

export const getServerSideProps = async (
	context: NextPageContext
): Promise<GetServerSidePropsResult<{list: TTokenListItem}>> => {
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
		const tokenListResponse = (await listRes.json()) as TTokenListItem;
		return {
			props: {
				list: {
					...tokenListResponse,
					URI: `https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/${listID}.json`
				}
			}
		};
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
