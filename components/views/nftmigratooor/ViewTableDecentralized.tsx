import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IconCheck from 'components/icons/IconCheck';
import {BigNumber, ethers} from 'ethers';
import {request} from 'graphql-request';
import axios from 'axios';
import useSWR from 'swr';
import {useMountEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';

const fetcher = async (query: string): Promise<{account: TAccount}> => (
	request('https://api.thegraph.com/subgraphs/name/ryry79261/mainnet-erc721-erc1155', query)
);

export type TENSFetcher = {
	domains: {
		labelName: string;
	}[]
}
const ensFetcher = async (query: string): Promise<TENSFetcher> => (
	request('https://api.thegraph.com/subgraphs/name/ensdomains/ens', query)
);


export type TAccount = {
	id: string;
	ERC721tokens: TERC721token[];
}

export type TERC721token = {
	id: string;
	identifier: string;
	contract: TContract;
	owner: TOwner;
	approval: TApproval;
	uri: string;
}

export type TContract = {
	id: string;
	name: null;
	symbol: null;
}

export type TOwner = {
	id: string;
}

export type TApproval = {
	id: string;
}

function	prepareURI(uri: string): string {
	let	finalURI = uri;
	if (finalURI?.startsWith('ipfs://')) {
		finalURI = `https://ipfs.io/ipfs/${finalURI.replace('ipfs://', '')}`;
	}
	finalURI = (finalURI || '').replace('https://api.poap.xyz/', 'https://api.poap.tech/');
	return finalURI;
}

function	NFTRenderer({contractAddress, tokenID, uri}: {contractAddress: TAddress, tokenID: string, uri: string}): ReactElement {
	const {safeChainID} = useChainID();
	const [svg, set_svg] = useState<string | null>(null);
	const [isEns, set_isEns] = useState<boolean>(false);
	const [isDCL, set_isDCL] = useState<boolean>(false);
	const [isImage, set_isImage] = useState<boolean>(false);
	const [isVideo, set_isVideo] = useState<boolean>(false);
	const [httpURI, set_httpURI] = useState(prepareURI(uri));

	function parseImage(imageData: string): void {
		if (imageData?.startsWith('data:image/svg+xml;base64')) {
			let _svg = String(Buffer.from(imageData.split(',')[1], 'base64'));
			_svg = _svg.replace(/width=".*?"/g, '');
			_svg = _svg.replace(/height=".*?"/g, '');
			if (!_svg.includes('viewBox=')) {
				_svg = _svg.replace(/<svg/g, '<svg width="100%" height="100%"');
				const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				newSVG.style.visibility = 'invisible';
				newSVG.style.position = 'absolute';
				newSVG.style.top = '-1000px';
				newSVG.style.left = '-1000px';
				newSVG.style.pointerEvents = 'none';
				newSVG.innerHTML = _svg;
				document.body.appendChild(newSVG);
				const bBox = newSVG.getBBox();
				_svg = _svg.replace(/<svg/g, '<svg viewBox="'+ bBox.x + ' ' + bBox.y + ' ' + bBox.width + ' ' + bBox.height + '"');
				document.body.removeChild(newSVG);
			}
			set_svg(_svg);
		} else if (imageData?.startsWith('<svg')) {
			let _svg = imageData;
			_svg = _svg.replace(/width=".*?"/g, '');
			_svg = _svg.replace(/height=".*?"/g, '');
			if (!_svg.includes('viewBox=')) {
				_svg = _svg.replace(/<svg/g, '<svg width="100%" height="100%"');
				const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				newSVG.style.visibility = 'invisible';
				newSVG.style.position = 'absolute';
				newSVG.style.top = '-1000px';
				newSVG.style.left = '-1000px';
				newSVG.style.pointerEvents = 'none';
				newSVG.innerHTML = _svg;
				document.body.appendChild(newSVG);
				const bBox = newSVG.getBBox();
				_svg = _svg.replace(/<svg/g, '<svg viewBox="'+ bBox.x + ' ' + bBox.y + ' ' + bBox.width + ' ' + bBox.height + '"');
				document.body.removeChild(newSVG);
			}
			set_svg(_svg);
		} else if (imageData?.startsWith('http') || imageData?.startsWith('ipfs')) {
			//check the type of extension and determine if it's an image or video
			if (imageData?.endsWith('.mp4')) {
				set_isVideo(true);
			} else {
				set_isImage(true);
			}
			set_httpURI(prepareURI(imageData));
		}

	}

	useMountEffect(async (): Promise<void> => {
		if (contractAddress === toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85')) {
			set_isEns(true);
		} else if (contractAddress === toAddress('0x2A187453064356c898cAe034EAed119E1663ACb8')) {
			set_isDCL(true);
		} else if (httpURI?.startsWith('http')) {
			if (httpURI.endsWith('.svg') || httpURI.endsWith('.png') || httpURI.endsWith('.jpg') || httpURI.endsWith('.jpeg') || httpURI.endsWith('.gif')) {
				set_isImage(true);
			} else if (httpURI.endsWith('.mp4')) {
				set_isVideo(true);
			} else {
			//fetch the URI with axios and check if the content type returned is an image
				try {
					const response = await axios.get(httpURI);
					if (response.headers['content-type'].startsWith('image')) {
						set_isImage(true);
					} else if (response.headers['content-type'].startsWith('video')) {
						set_isVideo(true);
					} else {
						parseImage(response.data?.image || response.data?.image_data || response?.data?.image_url);
					}
				} catch (e) {
					console.error(e);
				}
			}
		} else {
			try {
				const	currentProvider = getProvider(safeChainID);
				const	contract = new ethers.Contract(
					contractAddress,
					['function tokenURI(uint256 tokenID) public view returns (string)'],
					currentProvider
				);
				const value = await contract.tokenURI(tokenID);
				if (value.startsWith('data:application/json;base64')) {
					const json = JSON.parse(String(Buffer.from(value.split(',')[1], 'base64')));
					parseImage(json?.image || json?.image_data || json?.image_url);
				}
			} catch (error) {
				console.error(error);
			}
		}
	});

	const	{data} = useSWR(
		!isEns && !isDCL ? null : `{domains(first:1, where:{labelhash:"${BigNumber.from(tokenID).toHexString()}"}){labelName}}`,
		ensFetcher
	);
	const	ensName = data?.domains?.[0]?.labelName || '';

	// linear- gradient(330.4deg, #44BCF0 4.54%, #7298F8 59.2%, #A099FF 148.85%)

	if (isEns) {
		return (
			<div
				className={'flex aspect-square w-full items-center justify-center p-2'}
				style={{background: 'linear-gradient(330.4deg, #44BCF0 4.54%, #7298F8 59.2%, #A099FF 148.85%)'}}>
				<div className={'text-lg font-bold text-white'}>{`${ensName}.eth`}</div>
			</div>
		);
	} if (isDCL) {
		return (
			<div
				className={'flex aspect-square w-full items-center justify-center p-2'}
				style={{background: 'linear-gradient(180deg,#ff2d55,#ff7439)'}}>
				<div className={'text-lg font-bold text-white'}>{`${ensName}.dcl`}</div>
			</div>
		);
	}
	if (svg) {
		return (
			<div
				className={'flex aspect-square w-full items-center justify-center p-2'}
				dangerouslySetInnerHTML={{__html: svg}}>
			</div>
		);
	}
	if (isVideo) {
		return (
			<div className={'flex aspect-square w-full items-center justify-center p-2'}>
				<video
					width={500}
					height={500}
					controls>
					<source src={httpURI} type={'video/mp4'} />
				</video>
			</div>
		);
	}
	if (isImage) {
		return (
			<div className={'flex aspect-square w-full items-center justify-center p-2'}>
				<Image
					alt={''}
					width={500}
					height={500}
					unoptimized
					src={httpURI} />
			</div>
		);
	}
	if (!httpURI) {
		return <div className={'yearn--table-token-section-item-image h-20 w-20'} />;
	}

	return (
		<div className={'flex aspect-square w-full items-center justify-center p-2'}>
			<Image
				alt={''}
				width={40}
				height={40}
				unoptimized
				src={httpURI} />
		</div>
	);
}

function	TokenRow({erc721Token}: {erc721Token: TERC721token}): ReactElement {
	const [isSelected, set_isSelected] = useState(false);
	const chain = useChain();

	return (
		<button
			className={`hover group relative flex w-full items-center justify-center p-4 md:p-6 ${isSelected ? 'box-100' : 'box-0'}`}>
			<div className={'relative flex w-full flex-col items-center justify-center'}>
				<div
					suppressHydrationWarning
					className={`mb-4 flex w-full items-center justify-center border border-neutral-200 transition-colors group-hover:bg-neutral-0 ${isSelected ? 'bg-neutral-0' : ''}`}>
					{/* {cloneElement(icon, {className: 'h-5 md:h-6 w-5 md:w-6 text-neutral-900'})} */}
					<NFTRenderer
						contractAddress={toAddress(erc721Token.contract.id)}
						tokenID={erc721Token.identifier}
						uri={erc721Token.uri} />
				</div>
				<b suppressHydrationWarning className={'text-sm md:text-base'}>
					{toAddress(erc721Token?.contract?.id) === toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85') ? 'ENS' : erc721Token.contract.name}
				</b>
				<Link
					href={`${chain.getCurrent()?.block_explorer}/address/${erc721Token.contract.id}`}
					onClick={(e): void => e.stopPropagation()}
					className={'flex cursor-pointer flex-row items-center space-x-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
					<p className={'font-mono text-xs'}>{truncateHex(erc721Token.contract.id, 8)}</p>
					<IconLinkOut className={'h-3 w-3'} />
				</Link>
			</div>
			<IconCheck
				className={`absolute top-4 right-4 h-4 w-4 text-[#16a34a] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
		</button>
	);

	return (
		<div
			onClick={(): void => set_isSelected(!isSelected)}
			className={`group relative border-x-2 border-y-0 border-solid pb-2 text-left hover:bg-neutral-100/50 ${isSelected ? 'border-transparent' : 'border-transparent'}`}>
			<div className={'yearn--table-token-section-item'}>
				<NFTRenderer
					contractAddress={toAddress(erc721Token.contract.id)}
					tokenID={erc721Token.identifier}
					uri={erc721Token.uri} />
				<div>
					<div className={'flex flex-row items-center space-x-2'}>
						<b>{erc721Token.contract.name}</b>
					</div>
					<Link
						href={`${chain.getCurrent()?.block_explorer}/address/${erc721Token.contract.id}`}
						onClick={(e): void => e.stopPropagation()}
						className={'flex cursor-pointer flex-row items-center space-x-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
						<p className={'font-mono text-xs'}>{truncateHex(erc721Token.contract.id, 8)}</p>
						<IconLinkOut className={'h-3 w-3'} />
					</Link>
				</div>
			</div>
		</div>
	);
}

function	ViewTableDecentralized(): ReactElement {
	const	{address} = useWeb3();

	const	{data} = useSWR(!address ? null :
		`{
			account(id: "${address?.toLowerCase()}") {
				id
				ERC721tokens(first: 1000) {
					id
					identifier
					contract {
						id
						name
						symbol
					}
					owner {
						id
					}
					approval {
						id
					}
					uri
				}
			}
		}`, fetcher);

	const	ERC721Tokens = data?.account?.ERC721tokens;

	return (
		<div className={'box-0 relative grid w-full grid-cols-12 overflow-hidden'}>
			<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
				<div className={'w-full md:w-3/4'}>
					<b>{'Select the tokens to migrate'}</b>
					<p className={'text-sm text-neutral-500'}>
						{'Select the tokens you want to migrate to another wallet. You can migrate all your tokens at once or select individual tokens.'}
					</p>
				</div>
			</div>

			<div className={'col-span-12 grid grid-cols-3 gap-4 border-t border-neutral-200'}>
				{ERC721Tokens?.map((erc721Token: TERC721token): ReactElement => (
					<TokenRow key={erc721Token.id} erc721Token={erc721Token} />
				))}
			</div>
		</div>
	);
}

export default ViewTableDecentralized;
