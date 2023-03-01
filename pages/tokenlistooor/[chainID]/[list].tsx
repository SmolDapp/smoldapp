import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import ListOfTokens from 'components/app/tokenlistooor/ListOfTokens';
import ListOverview from 'components/app/tokenlistooor/ListOverview';
import ViewAddTokens from 'components/views/tokenlistooor/ViewAddTokens';
import {MigratooorContextApp} from 'contexts/useMigratooor';
import {ethers} from 'ethers';
import {useMountEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import useWeb3 from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {NextPageContext} from 'next';
import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TListDefaultProps = {
	listAddress: TAddress,
	mainListooor: TAddress,
	name: string,
	description: string,
	logoURI: string,
	baseURI: string,
	endorsed: boolean,
	count: number,
}
type TToken = {
	address: string;
	name: string;
	symbol: string;
	logoURI: string;
	chainID: number;
	decimals: number;
}


function	List({list, chainID}: {list: TListDefaultProps, chainID: number}): ReactElement {
	const	{provider, address} = useWeb3();
	const	[tokens, set_tokens] = useState<TToken[]>([]);
	const	[isListooor, set_isListooor] = useState<boolean>(false);

	function	loadTokens(): void {
		const	currentProvider = provider || getProvider(chainID);
		const	contract = new ethers.Contract(
			list.listAddress,
			[{'inputs': [{'internalType': 'uint256', 'name': 'fromIndex', 'type': 'uint256'}, {'internalType': 'uint256', 'name': 'toIndex', 'type': 'uint256'}], 'name': 'listTokens', 'outputs': [{'components': [{'internalType': 'address', 'name': 'tokenAddress', 'type': 'address'}, {'internalType': 'string', 'name': 'symbol', 'type': 'string'}, {'internalType': 'string', 'name': 'name', 'type': 'string'}, {'internalType': 'string', 'name': 'tokenURI', 'type': 'string'}, {'internalType': 'uint8', 'name': 'decimals', 'type': 'uint8'}], 'internalType': 'struct TokenListooor.TokenData[]', 'name': '', 'type': 'tuple[]'}], 'stateMutability': 'view', 'type': 'function'}],
			currentProvider
		);
		contract.listTokens(0, 100)
			.then((response: any): void => {
				const	_tokens: TToken[] = [];
				for (const token of response) {
					_tokens.push({
						address: toAddress(token[0]),
						symbol: token[1],
						name: token[2],
						logoURI: token[3],
						decimals: token[4],
						chainID: 1
					});
				}
				set_tokens(_tokens);
			}).catch((): void => {
				//
			});
	}

	useMountEffect((): void => {
		loadTokens();
	});

	useEffect((): void => {
		if (!address || !list.listAddress || !provider) {
			return;
		}
		const	contract = new ethers.Contract(
			list.listAddress,
			['function listooors(address) public view returns (bool)'],
			provider
		);
		contract.listooors(address).then((response: any): void => {
			set_isListooor(response);
		});
	}, [address, list.listAddress, provider]);

	return (
		<div className={'mx-auto mt-14 grid w-full max-w-4xl pb-40'}>
			<div className={'pb-4'}>
				<Link href={'/tokenlistooor'} className={'text-xs text-neutral-400'}>
					{'< Back to lists'}
				</Link>
			</div>
			<ListOverview list={list} />
			{isListooor ? (
				<ViewAddTokens
					listAddress={list.listAddress}
					tokensInList={tokens}
					onSuccess={loadTokens} />
			) : null}

			<div className={'mt-10'}>
				<div className={'flex w-full items-center justify-between'}>
					<h1 className={'text-xl font-bold text-neutral-900'}>
						{'Tokens'}
					</h1>

					<div>
						<Button>
							{'Add Tokens'}
						</Button>
					</div>
				</div>

				<ListOfTokens
					isListooor={isListooor}
					listAddress={list.listAddress}
					tokens={tokens}
					chainID={chainID}
					onRemoveSuccess={loadTokens} />
			</div>
		</div>
	);
}

export default function Wrapper({list, chainID}: {list: TListDefaultProps, chainID: number}): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={'Tokenlistooor - SmolDapp'}
					defaultTitle={'Tokenlistooor - SmolDapp'}
					description={'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/tokenlistooor',
						site_name: 'Tokenlistooor - SmolDapp',
						title: 'Tokenlistooor - SmolDapp',
						description: 'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.',
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
				<List list={list} chainID={chainID} />
			</>
		</MigratooorContextApp>
	);
}


Wrapper.getInitialProps = async ({query}: NextPageContext): Promise<{list: TListDefaultProps, chainID: number}> => {
	const	listAddress = toAddress((query?.list as string)?.split('/').pop() || '');
	const	chainID = Number(query?.chainID);
	let		currentProvider = getProvider(chainID);
	if (chainID === 1337) {
		currentProvider = new ethers.providers.JsonRpcProvider('http://0.0.0.0:8545');
	}
	const	registry = new ethers.Contract(
		toAddress(process.env.TOKENLISTOOOR_REGISTRY_ADDRESS),
		[{'inputs': [{'internalType': 'address', 'name': 'addr', 'type': 'address'}], 'name': 'getListByAddress', 'outputs': [{'components': [{'internalType': 'address', 'name': 'listAddress', 'type': 'address'}, {'internalType': 'string', 'name': 'name', 'type': 'string'}, {'internalType': 'string', 'name': 'description', 'type': 'string'}, {'internalType': 'string', 'name': 'logoURI', 'type': 'string'}, {'internalType': 'string', 'name': 'baseURI', 'type': 'string'}, {'internalType': 'bool', 'name': 'endorsed', 'type': 'bool'}], 'internalType': 'struct TokenListFactory.tokenlistooorStatus', 'name': '', 'type': 'tuple'}], 'stateMutability': 'view', 'type': 'function'}],
		currentProvider
	);

	const	contract = new ethers.Contract(
		listAddress,
		[
			'function countToken() public view returns (uint256)',
			'function mainListooor() public view public returns (address)'
		],
		currentProvider
	);
	const	[factory, count, mainListooor] = await Promise.all([
		registry.getListByAddress(listAddress),
		contract.countToken(),
		contract.mainListooor()
	]);
	return {
		chainID,
		list: {
			listAddress: toAddress(factory?.listAddress),
			mainListooor: toAddress(mainListooor),
			name: factory?.name,
			description: factory?.description,
			logoURI: factory?.logoURI,
			baseURI: factory?.baseURI,
			endorsed: factory?.endorsed,
			count: (count).toNumber()
		}
	};
};
