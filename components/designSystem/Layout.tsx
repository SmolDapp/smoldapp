import {type ReactElement, type ReactNode} from 'react';
import {WithAddressBook} from 'contexts/useAddressBook';
import {WithAddressBookCurtain} from 'contexts/useAddressBookCurtain';
import {AnimatePresence, motion} from 'framer-motion';
import {cl} from '@builtbymom/web3/utils';
import {IconQuestionMark} from '@icons/IconQuestionMark';
import {appWrapperVariants} from '@utils/animations';

import {SideMenu} from './SideMenu';
import {InfoCurtain} from './Curtains/InfoCurtain';
import {SideMenuMobile} from './SideMenu/SideMenuMobile';

import type {NextComponentType} from 'next';
import type {AppProps} from 'next/app';
import type {NextRouter} from 'next/router';

type TAppProp = {
	title: string;
	description: string;
	children: ReactNode;
	action?: ReactNode;
};
function App(props: TAppProp): ReactElement {
	return (
		<div>
			<div className={'absolute right-4 top-4 flex w-full justify-end'}>
				<InfoCurtain
					trigger={
						<div
							className={cl(
								'h-8 w-8 rounded-full',
								'bg-neutral-200 transition-colors hover:bg-neutral-300',
								'flex justify-center items-center'
							)}>
							<IconQuestionMark className={'size-6 text-neutral-600'} />
						</div>
					}
				/>
			</div>
			<section className={'-mt-2 w-full p-8'}>
				<div className={'mb-6 flex w-full flex-row justify-between md:max-w-108'}>
					<div>
						<h1 className={'text-3xl font-bold text-neutral-900'}>{props.title}</h1>
						<p className={'text-base text-neutral-600'}>{props.description}</p>
					</div>
					{props.action ? <div className={'mt-3'}>{props.action}</div> : null}
				</div>
				{props.children}
			</section>
		</div>
	);
}

type TComponent = NextComponentType & {
	AppName: string;
	AppDescription: string;
	getLayout: (p: ReactElement, router: NextRouter) => ReactElement;
	getAction: () => ReactElement;
};
export default function Layout(props: AppProps): ReactElement {
	const {Component, router} = props;
	const getLayout = (Component as TComponent).getLayout || ((page: ReactElement): ReactElement => page);
	const appName = (Component as TComponent).AppName || 'App';
	const appDescription = (Component as TComponent).AppDescription || '';
	const appAction = (Component as TComponent).getAction || (() => null);

	return (
		<div className={'mx-auto mt-10 w-full max-w-6xl'}>
			<div className={'grid w-full grid-cols-root'}>
				<motion.nav
					initial={{scale: 0.9, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{duration: 0.6, ease: 'easeInOut'}}
					className={'sticky top-10 z-20 col-sidebar hidden h-app flex-col rounded-lg bg-neutral-0 md:flex'}>
					<SideMenu />
				</motion.nav>

				<div className={'col-span-full mb-4 flex px-4 md:hidden'}>
					<SideMenuMobile />
				</div>

				<div className={'col-span-full px-4 md:col-main '}>
					<AnimatePresence mode={'wait'}>
						<motion.main
							key={appName}
							variants={appWrapperVariants}
							custom={router.isReady}
							animate={'animate'}
							exit={'exit'}
							initial={'initial'}
							className={'relative mb-10 min-h-app w-full overflow-x-hidden rounded-lg bg-neutral-0'}>
							<WithAddressBook>
								<WithAddressBookCurtain>
									<App
										title={appName}
										description={appDescription}
										action={appAction()}>
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
								</WithAddressBookCurtain>
							</WithAddressBook>
						</motion.main>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
