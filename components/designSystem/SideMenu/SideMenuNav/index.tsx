import {cloneElement, Fragment, type ReactElement} from 'react';
import {usePathname} from 'next/navigation';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {cl, isZeroAddress} from '@builtbymom/web3/utils';
import {IconAppAddressBook, IconAppDisperse, IconAppEarn, IconAppSend, IconAppStream} from '@icons/IconApps';
import {IconWallet} from '@icons/IconWallet';
import {useIsMounted} from '@react-hookz/web';
import {LinkOrDiv} from '@common/LinkOrDiv';

type TNavItemProps = {
	label: string;
	href: string;
	icon: ReactElement;
	isSelected: boolean;
	isDisabled?: boolean;
};
function NavItem({label, href, icon, isSelected, isDisabled = false}: TNavItemProps): ReactElement {
	return (
		<li className={'relative z-10 px-4'}>
			<LinkOrDiv
				href={href}
				isDisabled={isDisabled}>
				<div
					className={cl(
						'flex items-center gap-2 justify-between rounded-3xl px-4 py-2 transition-colors w-full',
						'group',
						isSelected ? 'bg-neutral-300' : isDisabled ? '' : 'hover:bg-neutral-300',
						isDisabled ? 'cursor-not-allowed' : ''
					)}>
					<div className={'flex items-center gap-2 text-neutral-600'}>
						{cloneElement(icon, {
							className: cl(
								'h-4 w-4',
								isSelected
									? 'text-neutral-900 text-neutral-600'
									: isDisabled
										? 'text-neutral-400'
										: 'group-hover:text-neutral-900'
							)
						})}
						<p
							className={cl(
								'transition-colors',
								isSelected
									? 'text-neutral-900'
									: isDisabled
										? 'text-neutral-400'
										: 'group-hover:text-neutral-900'
							)}>
							{label}
						</p>
					</div>
					{isDisabled && (
						<span className={'rounded-full bg-[#FFF3D3] px-2.5 py-0.5 text-center text-xxs text-[#FF9900]'}>
							{'Soon'}
						</span>
					)}
				</div>
			</LinkOrDiv>
		</li>
	);
}

function LogOutButton(): ReactElement {
	const isMounted = useIsMounted();
	const {address, onDesactivate} = useWeb3();
	if (isZeroAddress(address) || !isMounted()) {
		return <Fragment />;
	}

	return (
		<div className={'mt-auto px-4 pb-2'}>
			<button
				className={'text-xxs text-neutral-600 transition-colors hover:text-neutral-900'}
				onClick={onDesactivate}>
				{'Log out'}
			</button>
		</div>
	);
}

export function SideMenuNav(): ReactElement {
	const pathname = usePathname();

	return (
		<div className={'scrollable scrollbar-show h-full py-4'}>
			<section className={'flex h-full flex-col justify-between'}>
				<ul className={'grid gap-2 pb-8'}>
					<NavItem
						href={'/apps/send'}
						isSelected={pathname.startsWith('/apps/send')}
						label={'Send'}
						icon={<IconAppSend />}
					/>
					<NavItem
						href={'/apps/disperse'}
						isSelected={pathname.startsWith('/apps/disperse')}
						label={'Disperse'}
						icon={<IconAppDisperse />}
					/>
					<NavItem
						href={'/apps/earn'}
						isSelected={pathname.startsWith('/apps/earn')}
						label={'Earn'}
						icon={<IconAppEarn />}
						isDisabled
					/>
					<NavItem
						href={'/apps/stream'}
						isSelected={pathname.startsWith('/apps/stream')}
						label={'Stream'}
						icon={<IconAppStream />}
						isDisabled
					/>
					<NavItem
						href={'/apps/address-book'}
						isSelected={pathname.startsWith('/apps/address-book')}
						label={'Address Book'}
						icon={<IconAppAddressBook />}
					/>
					<NavItem
						href={'/apps/wallet'}
						isSelected={pathname.startsWith('/apps/wallet')}
						label={'Wallet'}
						icon={<IconWallet />}
					/>
				</ul>

				<LogOutButton />
			</section>
		</div>
	);
}
