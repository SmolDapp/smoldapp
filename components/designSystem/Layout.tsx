import {type ReactElement, type ReactNode} from 'react';
import {AddressBookCurtainContextApp} from 'contexts/useAddressBookCurtain';
import {AnimatePresence, motion} from 'framer-motion';
import {IconQuestionMark} from '@icons/IconQuestionMark';
import {appWrapperVariants} from '@utils/animations';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {InfoCurtain} from './Curtain';
import {NavProfile} from './Profile';
import {SideMenu} from './SideMenu';

import type {NextComponentType} from 'next';
import type {AppProps} from 'next/app';
import type {NextRouter} from 'next/router';

type TAppProp = {
	title: string;
	description: string;
	children: ReactNode;
};
function App(props: TAppProp): ReactElement {
	return (
		<div>
			<div className={'flex w-full justify-end pr-4 pt-4'}>
				<InfoCurtain
					trigger={
						<div
							className={cl(
								'h-8 w-8 rounded-full',
								'bg-neutral-200 transition-colors hover:bg-neutral-300',
								'flex justify-center items-center'
							)}>
							<IconQuestionMark className={'h-6 w-6 text-neutral-600'} />
						</div>
					}
				/>
			</div>
			<section className={'-mt-2 w-full p-10 pt-0'}>
				<div className={'mb-6'}>
					<h1 className={'text-3xl font-bold text-neutral-900'}>{props.title}</h1>
					<p className={'text-base text-neutral-600'}>{props.description}</p>
				</div>
				{props.children}
			</section>
		</div>
	);
}

function Nav(): ReactElement {
	return (
		<>
			<NavProfile />
			<div className={'h-0.5 w-full bg-neutral-200'} />
			<SideMenu />
		</>
	);
}

type TComponent = NextComponentType & {
	AppName: string;
	AppDescription: string;
	getLayout: (p: ReactElement, router: NextRouter) => ReactElement;
};
export default function Layout(props: AppProps): ReactElement {
	const {Component, router} = props;
	const getLayout = (Component as TComponent).getLayout || ((page: ReactElement): ReactElement => page);
	const appName = (Component as TComponent).AppName || 'App';
	const appDescription = (Component as TComponent).AppDescription || '';

	return (
		<div className={'mx-auto mt-10 w-full max-w-6xl pl-4 pr-8'}>
			<div className={'grid w-full grid-cols-root space-x-4'}>
				<motion.nav
					initial={{scale: 0.9, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{duration: 0.6, ease: 'easeInOut'}}
					className={'sticky top-10 z-20 col-sidebar flex h-app flex-col rounded-lg bg-neutral-0'}>
					<Nav />
				</motion.nav>

				<AnimatePresence mode={'wait'}>
					<motion.main
						key={appName}
						variants={appWrapperVariants}
						custom={router.isReady}
						animate={'animate'}
						exit={'exit'}
						initial={'initial'}
						className={
							'relative col-main mb-10 min-h-app w-full overflow-x-hidden rounded-lg bg-neutral-0'
						}>
						<AddressBookCurtainContextApp>
							<App
								title={appName}
								description={appDescription}>
								<motion.div
									initial={{scale: 0.9, opacity: 0}}
									animate={{scale: 1, opacity: 1}}
									transition={{
										delay: router.isReady ? 0.2 : 0.4,
										duration: 0.6,
										ease: 'easeInOut'
									}}>
									{getLayout(<Component {...props} />, router)}
								</motion.div>
							</App>
						</AddressBookCurtainContextApp>
					</motion.main>
				</AnimatePresence>
			</div>
		</div>
	);
}
