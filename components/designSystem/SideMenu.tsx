import {cloneElement, Fragment, type ReactElement, useState} from 'react';
import {
	IconAppAddressBook,
	IconAppDisperse,
	IconAppEarn,
	IconAppMigrate,
	IconAppSend,
	IconAppSwap
} from '@icons/IconApps';
import {useIsMounted} from '@react-hookz/web';
import {isZeroAddress} from '@utils/tools.address';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {cl} from '@yearn-finance/web-lib/utils/cl';

type TNavItemProps = {
	label: string;
	icon: ReactElement;
	isSelected: boolean;
	onSelect: () => void;
};
function NavItem(props: TNavItemProps): ReactElement {
	return (
		<li>
			<button
				onClick={props.onSelect}
				className={cl(
					'flex items-center gap-2 rounded-3xl px-4 py-2 transition-colors w-full',
					props.isSelected ? 'bg-neutral-300' : 'bg-neutral-0 hover:bg-neutral-300'
				)}>
				{cloneElement(props.icon, {className: 'h-4 w-4 text-neutral-600'})}
				<p className={props.isSelected ? 'text-neutral-900' : 'text-neutral-600'}>{props.label}</p>
			</button>
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
export function SideMenu(): ReactElement {
	const [currentPage, set_currentPage] = useState<string>('send');

	return (
		<>
			<section className={'flex h-full flex-col p-4'}>
				<ul className={'grid gap-2'}>
					<NavItem
						onSelect={() => set_currentPage('send')}
						isSelected={currentPage === 'send'}
						label={'Send'}
						icon={<IconAppSend />}
					/>
					<NavItem
						onSelect={() => set_currentPage('disperse')}
						isSelected={currentPage === 'disperse'}
						label={'Disperse'}
						icon={<IconAppDisperse />}
					/>
					<NavItem
						onSelect={() => set_currentPage('migrate')}
						isSelected={currentPage === 'migrate'}
						label={'Migrate'}
						icon={<IconAppMigrate />}
					/>
					<NavItem
						onSelect={() => set_currentPage('swap')}
						isSelected={currentPage === 'swap'}
						label={'Swap'}
						icon={<IconAppSwap />}
					/>
					<NavItem
						onSelect={() => set_currentPage('earn')}
						isSelected={currentPage === 'earn'}
						label={'Earn'}
						icon={<IconAppEarn />}
					/>
					<NavItem
						onSelect={() => set_currentPage('address_book')}
						isSelected={currentPage === 'address_book'}
						label={'Address Book'}
						icon={<IconAppAddressBook />}
					/>
				</ul>

				<LogOutButton />
			</section>
		</>
	);
}
