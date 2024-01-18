import {cloneElement, Fragment, type ReactElement} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cl, isZeroAddress} from '@builtbymom/web3/utils';
import {
	IconAppAddressBook,
	IconAppDisperse,
	IconAppEarn,
	IconAppMigrate,
	IconAppSend,
	IconAppSwap
} from '@icons/IconApps';
import {useIsMounted} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

type TNavItemProps = {
	label: string;
	href: string;
	icon: ReactElement;
	isSelected: boolean;
};
function NavItem(props: TNavItemProps): ReactElement {
	return (
		<li className={'relative z-10'}>
			<Link href={props.href}>
				<div
					className={cl(
						'flex items-center gap-2 rounded-3xl px-4 py-2 transition-colors w-full',
						'group hover:bg-neutral-300',
						props.isSelected ? 'bg-neutral-300' : 'hover:bg-neutral-300'
					)}>
					{cloneElement(props.icon, {
						className: cl(
							'h-4 w-4',
							props.isSelected ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'
						)
					})}
					<p
						className={cl(
							'transition-colors',
							props.isSelected ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'
						)}>
						{props.label}
					</p>
				</div>
			</Link>
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
		<>
			<section className={'flex h-full flex-col p-4'}>
				<ul className={'grid gap-2'}>
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
						href={'/apps/migrate'}
						isSelected={pathname.startsWith('/apps/migrate')}
						label={'Migrate'}
						icon={<IconAppMigrate />}
					/>
					<NavItem
						href={'/apps/swap'}
						isSelected={pathname.startsWith('/apps/swap')}
						label={'Swap'}
						icon={<IconAppSwap />}
					/>
					<NavItem
						href={'/apps/earn'}
						isSelected={pathname.startsWith('/apps/earn')}
						label={'Earn'}
						icon={<IconAppEarn />}
					/>
					<NavItem
						href={'/apps/address-book'}
						isSelected={pathname.startsWith('/apps/address-book')}
						label={'Address Book'}
						icon={<IconAppAddressBook />}
					/>
				</ul>

				<LogOutButton />
			</section>
		</>
	);
}
