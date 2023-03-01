import React, {useCallback, useState} from 'react';
import {useRouter} from 'next/router';
import IconCheck from 'apps/common/icons/IconCheck';
import IconCircleCross from 'apps/common/icons/IconCircleCross';
import IconInfo from 'apps/common/icons/IconInfo';
import {ethers} from 'ethers';
import {deployTokenList} from 'utils/actions/deployTokenList';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ChangeEventHandler, DetailedHTMLProps, InputHTMLAttributes, ReactElement} from 'react';

function	SvgDesign(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<>
			<svg
				{...props}
				viewBox={'0 0 132 132'}
				fill={'none'}
				xmlns={'http://www.w3.org/2000/svg'}>
				<path
					d={'M10.9546 34.0532L65.6064 2.49994L120.258 34.0532V97.1596L65.6064 128.713L10.9546 97.1596V34.0532Z'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M10.9546 34.0532L65.6064 2.49994L120.258 34.0532V97.1596L65.6064 128.713L10.9546 97.1596V34.0532Z'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 65.4756L65.6069 97.4915L9.97266 65.4756'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 65.4756L65.6069 97.4915L9.97266 65.4756'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 81.4829L93.424 97.4909L79.5154 105.495M9.97266 81.4829L37.7898 97.4909L51.6983 105.495'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 81.4829L93.424 97.4909L79.5154 105.495M9.97266 81.4829L37.7898 97.4909L51.6983 105.495'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 49.4668L65.6069 81.4827L9.97266 49.4668'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 49.4668L65.6069 81.4827L9.97266 49.4668'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 33.459L65.6069 65.4749L9.97266 33.459'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 33.459L65.6069 65.4749L9.97266 33.459'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M106.413 25.9834L65.606 49.4668L24.7988 25.9834'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M106.413 25.9834L65.606 49.4668L24.7988 25.9834'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M79.5801 25.418L65.606 33.4597L51.6318 25.418'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M79.5801 25.418L65.606 33.4597L51.6318 25.418'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M93.4238 33.459L65.6067 17.451L37.7896 33.459'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M93.4238 33.459L65.6067 17.451L37.7896 33.459'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M9.97184 97.4912L23.8804 89.4872M121.24 97.4912L107.332 89.4872'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M9.97184 97.4912L23.8804 89.4872M121.24 97.4912L107.332 89.4872'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7893 97.4911L23.8807 105.495M93.4235 97.4911L107.332 105.495'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7893 97.4911L23.8807 105.495M93.4235 97.4911L107.332 105.495'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7896 113.499L65.6067 97.4911L93.4238 113.499'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7896 113.499L65.6067 97.4911L93.4238 113.499'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M51.6976 121.503L65.6061 113.499L79.5146 121.503'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M51.6976 121.503L65.6061 113.499L79.5146 121.503'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
			</svg>
		</>
	);
}

type TFormSectionProps = {
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
function	FormSectionLayout({value, onChange, children, ...rest}: TFormSectionProps): ReactElement {
	return (
		<div className={'box-0 mt-1 flex h-10 w-full items-center p-2'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
				<input
					{...rest}
					id={'listName'}
					required
					value={value}
					onChange={onChange}
					autoComplete={'off'}
					className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm outline-none scrollbar-none'}
					type={'text'} />
			</div>
			{children}
		</div>
	);
}

function	ViewNewListName(): ReactElement {
	const	{provider, chainID} = useWeb3();
	const	router = useRouter();
	const	[name, set_name] = useState<string>('');
	const	[description, set_description] = useState<string>('');
	const	[baseURI, set_baseURI] = useState<string>('');
	const	[isValidBaseURI, set_isValidBaseURI] = useState<boolean | 'undetermined'>('undetermined');
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);

	const	checkValidBaseURI = useCallback((): void => {
		set_isValidBaseURI(!!baseURI.match(/^(https?|ipfs):\/\//));
	}, [baseURI]);

	async function	onCreateTokenList(): Promise<void> {
		if (!txStatus.none) {
			return;
		}
		//remove trailing slash from baseURI
		const	trimmedBaseURI = baseURI.replace(/\/$/, '');
		new Transaction(provider, deployTokenList, set_txStatus).populate(
			name,
			description,
			`${trimmedBaseURI}/_logo.png`,
			`${trimmedBaseURI}/`
		).onSuccess(async (r): Promise<void> => {
			const abi = ['event ListCreated(address indexed listAddress, string name, string description, string baseURI)'];
			const iface = new ethers.utils.Interface(abi);
			const listCreatedLog = r?.logs?.[0] || null;
			if (listCreatedLog) {
				const	eventArguments = iface.parseLog(listCreatedLog);
				const	listAddress = toAddress(eventArguments.args[0]);
				router.push(`/tokenlistooor/${chainID}/${listAddress}`);
			}
		}).perform();
	}

	return (
		<>
			{/* <div className={'box-0 overflow-hidden'}></div> */}
			<div className={'box-0 mb-4 grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-2 w-full'}>
					<div className={'flex aspect-square w-full flex-col items-center justify-center bg-neutral-900 p-6'}>
						<SvgDesign className={'mx-auto w-3/4 object-cover text-neutral-0'} />
					</div>
				</div>
				<div className={'col-span-10 w-full p-6'}>
					<b>{'Build you own Tokenlist'}</b>
					<p className={'mt-2 text-sm text-neutral-500'}>
						{'No matter your purpose, you can now deploy and manage a token registry on any supported chain. Select listooors, add tokens, upload logo and you\'re set!'}
					</p>
				</div>
			</div>

			<form
				className={'box-0 mt-2 space-y-4 p-6'}
				onSubmit={async (e): Promise<void> => {
					e.preventDefault();
					onCreateTokenList();
				}}>
				<div>
					<b>{'Follow the list, fill the form and you\'re set!'}</b>
					<div className={'mt-2 flex flex-col text-sm'}>
						<fieldset className={'box-100 p-6 pt-4'}>
							<div className={'mt-2 flex flex-col space-y-2'}>
								<label>
									<input
										type={'checkbox'}
										required
										className={'h-3 w-3 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'} />
									<span className={'pl-2 text-neutral-900'}>
										{'Read the '}
										<a
											href={'https://'}
											className={'cursor-pointer underline transition-colors hover:text-neutral-900'}
											target={'_blank'}
											rel={'noreferrer'}>
											{'documentation'}
										</a>
										{' about how the asset directory works'}
									</span>
								</label>
								<label>
									<input
										type={'checkbox'}
										required
										className={'h-3 w-3 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'} />
									<span className={'pl-2 text-neutral-900'}>
										{'Reproduce the TokenListooor Asset '}
										<a
											href={'https://github.com/SmolDapp/tokenAssets'}
											className={'cursor-pointer underline transition-colors hover:text-neutral-900'}
											target={'_blank'}
											rel={'noreferrer'}>
											{'directory'}
										</a>
										{' structure on your storage provider.'}
									</span>
								</label>
								<label>
									<input
										type={'checkbox'}
										required
										className={'h-3 w-3 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'} />
									<span className={'pl-2 text-neutral-900'}>
										{'Add a '}
										<code className={'bg-neutral-200 p-1'}>
											{'_logo.png'}
										</code>
										{' file with your logo to the root of the directory (size: 256x256).'}
									</span>
								</label>
							</div>
						</fieldset>

						<fieldset className={'mt-6'}>
							<legend className={'pl-1 text-sm font-medium'}>
								{'Provide your directory base URI'}
							</legend>
							<div className={'box-0 mt-1 flex h-10 w-full items-center p-2'}>
								<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
									<input
										id={'listName'}
										required
										value={baseURI}
										onChange={(e): void => {
											set_isValidBaseURI('undetermined');
											set_baseURI(e.target.value);
										}}
										onFocus={(): void => checkValidBaseURI()}
										onBlur={(): void => checkValidBaseURI()}
										autoComplete={'off'}
										placeholder={'E.g. https://assets.smold.app/'}
										pattern={'^(https?://|ipfs://).+'}
										className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm outline-none scrollbar-none'}
										type={'text'} />
								</div>
								<div className={'pointer-events-none relative h-4 w-4'}>
									<IconCheck
										className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${baseURI !== '' && isValidBaseURI === true ? 'opacity-100' : 'opacity-0'}`} />
									<IconCircleCross
										className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${baseURI !== '' && isValidBaseURI === false ? 'opacity-100' : 'opacity-0'}`} />
								</div>
							</div>
						</fieldset>

						<fieldset className={'mt-4'}>
							<legend className={'flex flex-row items-center pl-1 text-sm font-medium'}>
								{'Give a name to your list'}
								<div className={'tooltip'}>
									<IconInfo className={'ml-2 h-[10px] w-[14px] text-neutral-600'} />
									<span className={'tooltiptext text-xs'}>
										<p>{'It will be used to identify your list. A limit of 32 characters is enforced. Make it short!'}</p>
									</span>
								</div>
							</legend>
							<FormSectionLayout
								placeholder={'E.g. My TokenList'}
								autoFocus
								value={name}
								onChange={(e): void => set_name(e.target.value)} />
						</fieldset>

						<fieldset className={'mt-4'}>
							<legend className={'flex flex-row items-center pl-1 text-sm font-medium'}>
								{'Give a description to your list'}
								<div className={'tooltip'}>
									<IconInfo className={'ml-2 h-[10px] w-[10px] text-neutral-600'} />
									<span className={'tooltiptext text-xs'}>
										<p>{'It should explain in less than 128 characters who you are. Be creative!'}</p>
									</span>
								</div>
							</legend>
							<FormSectionLayout
								placeholder={'E.g. A curated list of tokens from all the token lists on tokenlistooor.'}
								value={description}
								onChange={(e): void => set_description(e.target.value)} />
						</fieldset>
					</div>
				</div>

				<div className={'flex flex-row justify-end'}>
					<Button isBusy={txStatus.pending}>
						{'Deploy a new list'}
					</Button>
				</div>
			</form>
		</>
	);
}

export default ViewNewListName;
