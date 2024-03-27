import {type ReactElement, useMemo, useState} from 'react';
import {CommandList} from 'cmdk';
import {Command, CommandEmpty, CommandInput, CommandItem} from 'components/Primitives/Commands';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {toSafeChainID} from '@builtbymom/web3/hooks/useChainID';
import {cl} from '@builtbymom/web3/utils';
import {IconChevron} from '@icons/IconChevron';
import * as Popover from '@radix-ui/react-popover';
import {useIsMounted} from '@react-hookz/web';
import {supportedNetworks} from '@utils/tools.chains';
import {ImageWithFallback} from '@common/ImageWithFallback';

export function NetworkPopoverSelector(): ReactElement {
	const isMounted = useIsMounted();
	const {onSwitchChain, chainID} = useWeb3();
	const safeChainID = toSafeChainID(chainID, Number(process.env.BASE_CHAINID));

	const currentNetwork = useMemo(
		() => supportedNetworks.find((network): boolean => network.id === safeChainID),
		[safeChainID]
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
						'bg-neutral-200 hover:bg-neutral-300 transition-colors '
					)}>
					<div className={'flex w-full max-w-full justify-between gap-1 text-left text-xs'}>
						{isMounted() && currentNetwork?.name ? (
							<div className={'flex w-full max-w-full gap-2 truncate'}>
								<ImageWithFallback
									width={16}
									height={16}
									alt={currentNetwork.name}
									src={`${process.env.SMOL_ASSETS_URL}/chain/${currentNetwork.id}/logo-32.png`}
								/>
								<p className={'truncate'}>{currentNetwork?.name}</p>
							</div>
						) : (
							<p className={'truncate'}>{'Select chain'}</p>
						)}
						<div>
							<IconChevron className={'ml-1 size-4 rotate-90'} />
						</div>
					</div>
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
					<CommandList className={'max-h-48 overflow-y-auto'}>
						{supportedNetworks.map(network => (
							<CommandItem
								key={network.id}
								value={network.name}
								className={cl(
									'relative flex cursor-pointer items-center rounded-lg p-2',
									'outline-none select-none transition-colors',
									'text-xs text-neutral-800 group',
									'focus:bg-neutral-300',
									'bg-neutral-0 hover:bg-neutral-200',
									currentNetwork?.id === network.id ? 'bg-neutral-200' : ''
								)}
								onSelect={selectedNetwork => {
									if (selectedNetwork === currentNetwork?.name) {
										return;
									}
									const chain = supportedNetworks.find(
										network => network.name.toLowerCase() === selectedNetwork.toLocaleLowerCase()
									);
									onSwitchChain(chain?.id || 1);
									set_isOpen(false);
								}}>
								<ImageWithFallback
									width={16}
									height={16}
									className={'mr-2'}
									alt={network.name}
									src={`${process.env.SMOL_ASSETS_URL}/chain/${network.id}/logo-32.png`}
								/>
								{network.name}
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}
