'use client';

import React, {Fragment} from 'react';
import Image from 'next/image';

import {ConnectPart} from './ConnectPart';
import {LinksPart} from './LinksPart';
import {ProfilePart} from './ProfilePart';

import type {ReactElement} from 'react';

function SectionHeader(): ReactElement {
	return (
		<Fragment>
			<div className={'relative w-full py-24'}>
				<div className={'absolute inset-0 z-0'}>
					<Image
						src={'/hero.jpg'}
						alt={''}
						className={'absolute inset-0 h-full w-full object-cover'}
						width={1500}
						height={500}
					/>
				</div>

				<section className={'z-10 mx-auto grid w-full max-w-5xl'}>
					<div className={'flex flex-col justify-center'}>
						<div className={'box-0 relative grid grid-cols-1 gap-10 p-6 shadow md:grid-cols-12'}>
							<ProfilePart />
							<ConnectPart />
							<div className={'col-span-7 mt-auto flex w-full justify-between pt-2 md:hidden'}>
								<LinksPart />
							</div>
						</div>
					</div>
				</section>
			</div>
		</Fragment>
	);
}

export default SectionHeader;
