import {type ReactElement, type ReactNode} from 'react';
import {motion} from 'framer-motion';
import {IconQuestionMark} from '@icons/IconQuestionMark';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {Button} from '@common/Primitives/Button';

import {NavProfile} from './Profile';
import {SideMenu} from './SideMenu';
// import {NavProfile} from './Profile';
import {SmolAddressInput} from './SmolAddressInput';

type TAppProp = {
	title: string;
	description: string;
	children: ReactNode;
};
function App(props: TAppProp): ReactElement {
	return (
		<>
			<section className={'p-10'}>
				<div className={'mb-6'}>
					<h1 className={'text-3xl font-bold text-neutral-900'}>{props.title}</h1>
					<p className={'text-base text-neutral-600'}>{props.description}</p>
				</div>
				{props.children}
			</section>
			<div className={'absolute right-4 top-4'}>
				<button
					className={cl(
						'h-8 w-8 rounded-full',
						'bg-neutral-200 transition-colors hover:bg-neutral-300',
						'flex justify-center items-center'
					)}>
					<IconQuestionMark className={'h-6 w-6 text-neutral-600'} />
				</button>
			</div>
		</>
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

export default function Layout(): ReactElement {
	return (
		<div className={'mx-auto w-full max-w-6xl'}>
			<div className={'grid h-[816px] w-full grid-cols-root space-x-4'}>
				<motion.nav
					initial={{scale: 0.9, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{
						duration: 0.6,
						ease: 'easeInOut'
					}}
					className={'col-sidebar flex h-full flex-col rounded-lg bg-neutral-0'}>
					<Nav />
				</motion.nav>

				<motion.main
					initial={{scale: 0.9, opacity: 0}}
					animate={{scale: 1, opacity: 1}}
					transition={{
						delay: 0.2,
						duration: 0.6,
						ease: 'easeInOut'
					}}
					className={'relative col-main w-full rounded-lg bg-neutral-0'}>
					<App
						title={'Send'}
						description={'Deliver any of your tokens anywhere'}>
						<motion.div
							initial={{scale: 0.9, opacity: 0}}
							animate={{scale: 1, opacity: 1}}
							transition={{
								delay: 0.4,
								duration: 0.6,
								ease: 'easeInOut'
							}}
							className={'grid gap-4'}>
							<div className={'mb-2'}>
								<p className={'font-medium'}>{'Receiver'}</p>
								<SmolAddressInput />
							</div>
							<div>
								<p className={'font-medium'}>{'Token'}</p>
								<SmolAddressInput />
							</div>
							<div className={'w-full max-w-[442px]'}>
								<Button className={'w-full'}>
									<b>{'Send'}</b>
								</Button>
							</div>
						</motion.div>
					</App>
				</motion.main>
			</div>
		</div>
	);
}
