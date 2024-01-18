import {type ReactElement, useMemo, useState} from 'react';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from 'components/Primitives/Commands';
import {useConnect, usePublicClient} from 'wagmi';
import {cl} from '@builtbymom/web3/utils';
import {IconChevron} from '@icons/IconChevron';
import * as Popover from '@radix-ui/react-popover';
import {useIsMounted} from '@react-hookz/web';
import {supportedTestNetworks} from '@utils/tools.chains';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toSafeChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {ImageWithFallback} from '@common/ImageWithFallback';

export function NetworkPopoverSelector(): ReactElement {
	const isMounted = useIsMounted();
	const {onSwitchChain} = useWeb3();
	const publicClient = usePublicClient();
	const {connectors} = useConnect();
	const safeChainID = toSafeChainID(publicClient?.chain.id, Number(process.env.BASE_CHAINID));
	type TNetwork = {value: number; label: string};

	const supportedNetworks = useMemo((): TNetwork[] => {
		const injectedConnector = connectors.find((e): boolean => e.id.toLocaleLowerCase() === 'injected');
		if (injectedConnector) {
			const chainsForInjected = injectedConnector.chains;
			const testnet = supportedTestNetworks;

			return chainsForInjected
				.filter(({id}): boolean => {
					if (testnet.find((network): boolean => network.id === id)) {
						return false;
					}
					return true;
				})
				.map((network): TNetwork => ({value: network.id, label: network.name}));
		}
		return supportedNetworks.map((network): TNetwork => network);
	}, [connectors]);

	const currentNetwork = useMemo(
		(): TNetwork | undefined => supportedNetworks.find((network): boolean => network.value === safeChainID),
		[safeChainID, supportedNetworks]
	);

	const [isOpen, set_isOpen] = useState(false);
	return (
		<Popover.Root
			open={isOpen}
			onOpenChange={set_isOpen}>
			<Popover.Trigger asChild>
				<button
					role={'combobox'}
					aria-expanded={isOpen}
					className={cl(
						'flex w-full items-center justify-between rounded-lg p-2',
						'bg-neutral-200 hover:bg-neutral-300 transition-colors'
					)}>
					<p className={'truncate text-xs'}>
						{isMounted() && currentNetwork?.label ? currentNetwork?.label : 'Select chain...'}
					</p>
					<IconChevron className={'h-4 w-4 rotate-90'} />
				</button>
			</Popover.Trigger>

			<Popover.Content
				className={cl(
					'z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-400 bg-neutral-0 p-1',
					'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
					'data-[side=bottom]:slide-in-from-top-2',
					'DropdownMenuContent'
				)}
				style={{boxShadow: 'rgba(36, 40, 51, 0.08) 0px 0px 20px 8px'}}>
				<Command>
					<CommandInput placeholder={'Search chain...'} />
					<CommandEmpty>{'No chain found.'}</CommandEmpty>
					<CommandGroup className={'max-h-48 overflow-y-auto'}>
						{supportedNetworks.map(network => (
							<CommandItem
								key={network.value}
								value={network.label}
								className={cl(
									'relative flex cursor-pointer items-center rounded-lg p-2',
									'outline-none select-none transition-colors',
									'text-xs text-neutral-800 group',
									'focus:bg-neutral-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
									'bg-neutral-0 hover:bg-neutral-200',
									currentNetwork?.value === network.value ? 'bg-neutral-200' : ''
								)}
								onSelect={selectedNetwork => {
									if (selectedNetwork === currentNetwork?.label) {
										return;
									}
									const chain = supportedNetworks.find(
										network => network.label.toLowerCase() === selectedNetwork
									);
									onSwitchChain(chain?.value || 1);
									set_isOpen(false);
								}}>
								<ImageWithFallback
									width={16}
									height={16}
									className={'mr-2'}
									alt={network.label}
									src={`${process.env.SMOL_ASSETS_URL}/chain/${network.value}/logo-32.png`}
								/>
								{network.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}
