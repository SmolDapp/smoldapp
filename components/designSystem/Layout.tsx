import {type ReactElement, type ReactNode} from 'react';
import {WithAddressBook} from 'contexts/useAddressBook';
import {AnimatePresence, motion} from 'framer-motion';
import {cl} from '@builtbymom/web3/utils';
import {IconQuestionMark} from '@icons/IconQuestionMark';
import {appWrapperVariants} from '@utils/animations';

import {SideMenu} from './SideMenu';
import {InfoCurtain} from './Curtains/InfoCurtain';

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
				<div className={'md:max-w-108 mb-6 flex w-full flex-row justify-between'}>
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
			<div className={'grid-cols-root grid w-full'}>
				<motion.nav
					initial={{scale: 0.9, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{duration: 0.6, ease: 'easeInOut'}}
					className={'col-sidebar h-app bg-neutral-0 sticky top-10 z-20 flex flex-col rounded-lg'}>
					<SideMenu />
				</motion.nav>

				<div className={'col-main pl-4'}>
					<AnimatePresence mode={'wait'}>
						<motion.main
							key={appName}
							variants={appWrapperVariants}
							custom={router.isReady}
							animate={'animate'}
							exit={'exit'}
							initial={'initial'}
							className={'min-h-app bg-neutral-0 relative mb-10 w-full overflow-x-hidden rounded-lg'}>
							<WithAddressBook>
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
							</WithAddressBook>
						</motion.main>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
