import {type ReactElement} from 'react';
import {useBalance} from 'wagmi';
import {useIsMounted} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {Counter} from '@common/Counter';

export function CoinBalance(): ReactElement {
	const isMounted = useIsMounted();
	const {address} = useWeb3();
	const {chainID} = useChainID();
	const currentChain = getNetwork(chainID || 1).nativeCurrency;
	const {data: balance} = useBalance({chainId: chainID || 1, address});

	if (!isMounted()) {
		return (
			<div>
				<small>{'Coin'}</small>
				<div className={'skeleton-lg h-8 w-2/3'} />
			</div>
		);
	}
	return (
		<div>
			<small>{currentChain.symbol || 'ETH'}</small>
			<strong>
				<Counter
					className={'text-base leading-8'}
					value={Number(balance?.formatted || 0)}
					decimals={6}
				/>
			</strong>
		</div>
	);
}
