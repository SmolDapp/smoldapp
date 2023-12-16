import {SideMenuNav} from './SideMenuNav';
import {SideMenuProfile} from './SideMenuProfile';

import type {ReactElement} from 'react';

export function SideMenu(): ReactElement {
	return (
		<>
			<SideMenuProfile />
			<div className={'h-0.5 w-full bg-neutral-200'} />
			<SideMenuNav />
		</>
	);
}
