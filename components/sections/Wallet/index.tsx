import {type ReactElement, useMemo, useState} from 'react';
import {SmolTokenButton} from 'components/designSystem/SmolTokenButton';
import {FetchedToken} from 'contexts/useBalancesCurtain';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import {isAddressEqual} from 'viem';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {usePrices} from '@builtbymom/web3/hooks/usePrices';
import {cl, isAddress, toAddress} from '@builtbymom/web3/utils';
import {useDeepCompareMemo} from '@react-hookz/web';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

function WalletListHeader(): ReactElement {
	return (
		<>
			<div className={'mb-2 flex justify-between text-xs'}>
				<p>{'Token'}</p>
				<p>{'Balance'}</p>
			</div>
			<div className={'h-px bg-neutral-400'} />
		</>
	);
}

export function Wallet(): ReactElement {
	const {safeChainID} = useChainID();
	const [searchValue, set_searchValue] = useState('');
	const {address, onConnect} = useWeb3();
	const {addCustomToken} = useTokenList();
	const {tokensWithBalance, isLoading} = useTokensWithBalance();

	const searchTokenAddress = useMemo(() => {
		if (
			isAddress(searchValue) &&
			!tokensWithBalance.some(token => isAddressEqual(token.address, toAddress(searchValue)))
		) {
			return toAddress(searchValue);
		}
		return undefined;
	}, [tokensWithBalance, searchValue]);

	const filteredTokens = useDeepCompareMemo(() => {
		return tokensWithBalance.filter(
			token =>
				token.symbol.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				token.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				toAddress(token.address).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
		);
	}, [searchValue, tokensWithBalance]);

	const {data: prices} = usePrices({tokens: filteredTokens, chainId: safeChainID});

	const balancesTextLayout = useMemo(() => {
		let balancesText = undefined;

		if (filteredTokens.length === 0 && !searchTokenAddress) {
			balancesText = 'No tokens found';
		}
		if (!address) {
			balancesText = 'No wallet connected';
		}
		if (balancesText) {
			return (
				<div>
					<p className={'text-center text-xs text-neutral-600'}>{balancesText}</p>
				</div>
			);
		}

		return null;
	}, [address, filteredTokens.length, searchTokenAddress]);

	return (
		<div className={'w-full max-w-108 gap-4'}>
			<input
				className={cl(
					'w-full border-neutral-400 rounded-lg bg-transparent py-3 px-4 mb-4 text-base',
					'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
					'focus:placeholder:text-neutral-300 placeholder:transition-colors',
					'focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40'
				)}
				type={'text'}
				placeholder={'0x... or Name'}
				autoComplete={'off'}
				autoCorrect={'off'}
				spellCheck={'false'}
				value={searchValue}
				disabled={!address}
				onChange={e => set_searchValue(e.target.value)}
			/>
			{!searchTokenAddress && address && !balancesTextLayout && <WalletListHeader />}
			<div className={'scrollable mb-8 flex flex-col items-center gap-2 pb-2'}>
				{balancesTextLayout}
				{searchTokenAddress && (
					<FetchedToken
						tokenAddress={searchTokenAddress}
						displayInfo
						onSelect={selected => {
							addCustomToken(selected);
							set_searchValue('');
						}}
					/>
				)}
				{address ? (
					filteredTokens.map(token => (
						<SmolTokenButton
							key={token.address}
							token={token}
							price={prices ? prices[token.address] : undefined}
						/>
					))
				) : (
					<div className={'max-w-23 mt-3 w-full'}>
						<button
							onClick={() => {
								onConnect();
							}}
							className={
								'h-8 w-full rounded-lg bg-primary text-xs transition-colors hover:bg-primaryHover'
							}>
							{'Connect Wallet'}
						</button>
					</div>
				)}

				{isLoading && <IconLoader className={'mt-2 size-4 animate-spin text-neutral-900'} />}
			</div>
		</div>
	);
}
