import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

export type TSelected = {
	selected: TAddress[],
	amounts: TDict<TNormalizedBN>,
	destinationAddress: TAddress,
	walletProvider: string,
	set_selected: Dispatch<SetStateAction<TAddress[]>>,
	set_amounts: Dispatch<SetStateAction<TDict<TNormalizedBN>>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_walletProvider: Dispatch<SetStateAction<string>>
}
const	defaultProps: TSelected = {
	selected: [],
	amounts: {},
	destinationAddress: toAddress(),
	walletProvider: 'NONE',
	set_selected: (): void => undefined,
	set_amounts: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_walletProvider: (): void => undefined
};

const	SelectedContext = createContext<TSelected>(defaultProps);
export const SelectedContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{isActive} = useWeb3();
	const	[walletProvider, set_walletProvider] = useState('NONE');
	const	[destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const	[selected, set_selected] = useState<TAddress[]>([]);
	const	[amounts, set_amounts] = useState<TDict<TNormalizedBN>>({});

	useEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected([]);
				set_amounts({});
				set_destinationAddress(toAddress());
				set_walletProvider('NONE');
			});
		}
	}, [isActive]);

	const	contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		amounts,
		set_amounts,
		destinationAddress,
		set_destinationAddress,
		walletProvider,
		set_walletProvider
	}), [selected, set_selected, amounts, set_amounts, destinationAddress, set_destinationAddress, walletProvider, set_walletProvider]);

	return (
		<SelectedContext.Provider value={contextValue}>
			{children}
		</SelectedContext.Provider>
	);
};


export const useSelected = (): TSelected => useContext(SelectedContext);
