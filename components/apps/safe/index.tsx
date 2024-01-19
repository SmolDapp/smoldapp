import React, {Fragment, memo, useState} from 'react';
import NewSafe from 'components/apps/safe/NewSafe';
import IconSquarePlus from 'components/icons/IconSquarePlus';
import {IconClone} from '@icons/IconClone';
import {useUpdateEffect} from '@react-hookz/web';
import CardWithIcon from '@common/CardWithIcon';
import {PopoverSettings} from '@common/PopoverSettings';
import {PopoverSettingsItemExpert} from '@common/PopoverSettings.item.expert';
import {PopoverSettingsItemTestnets} from '@common/PopoverSettings.item.testnets';
import ViewSectionHeading from '@common/ViewSectionHeading';

import {
	SectionDisplayOwners,
	SectionDisplayPossibleDeployments,
	SectionDisplayThreshold,
	SectionSafeAddressInput
} from './Sections';
import {defaulMultiSafetProps, useMultiSafe} from './useSafe';

import type {ReactElement} from 'react';

function ViewFlowSelection(props: {currentTab: number; onChangeTab: (index: number) => void}): ReactElement {
	return (
		<div className={'grid grid-cols-12 gap-4 md:gap-6'}>
			<div className={'relative col-span-6'}>
				<CardWithIcon
					isSelected={props.currentTab === 0}
					icon={<IconClone />}
					label={'Clone my existing Safe'}
					onClick={() => props.onChangeTab(0)}
				/>
			</div>
			<div className={'relative col-span-6'}>
				<CardWithIcon
					isSelected={props.currentTab === 1}
					icon={<IconSquarePlus />}
					label={'Create a new Safe'}
					onClick={() => props.onChangeTab(1)}
				/>
			</div>
		</div>
	);
}

function CloneSafeForm(): ReactElement {
	return (
		<div className={'box-0 mt-6 grid w-full grid-cols-12'}>
			<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
				<ViewSectionHeading
					title={'One new safe, coming right up.'}
					content={
						<span>
							{'WARNING: your cloned safe will have the OG signers. '}
							{'If they are not frens anymore, create a new safe.'}
						</span>
					}
				/>

				<form
					suppressHydrationWarning
					onSubmit={async (e): Promise<void> => e.preventDefault()}
					className={'grid w-full grid-cols-12 flex-row items-start justify-between gap-4'}>
					<div className={'col-span-12'}>
						<SectionSafeAddressInput />
					</div>
				</form>
			</div>
		</div>
	);
}

function NewSafeForm(): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div className={'box-0 mt-6 grid w-full grid-cols-12'}>
			<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
				<ViewSectionHeading
					title={'One new safe, coming right up.'}
					content={'Deploy your Safe on multiple chains. A smol perk for using Smol.'}
					configSection={
						<PopoverSettings>
							<PopoverSettingsItemExpert
								isSelected={configuration.settings.shouldUseExpertMode}
								onChange={(isSelected: boolean) => {
									dispatchConfiguration({
										type: 'SET_SETTINGS',
										payload: {
											...configuration.settings,
											shouldUseExpertMode: isSelected
										}
									});
								}}
							/>
						</PopoverSettings>
					}
				/>

				<form
					suppressHydrationWarning
					onSubmit={async (e): Promise<void> => e.preventDefault()}
					className={'mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4'}>
					<div className={'col-span-12'}>
						<NewSafe />
					</div>
				</form>
			</div>
		</div>
	);
}

function SafeDeployments(): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div className={'box-0 mt-6 grid w-full grid-cols-12'}>
			<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
				<ViewSectionHeading
					title={'One new safe, coming right up.'}
					content={
						<span>
							{'Smol charges a smol '}
							<span className={'font-medium text-neutral-600'}>{'fee of $4.20'}</span>
							{' per deployment.'}
						</span>
					}
					configSection={
						<PopoverSettings>
							<PopoverSettingsItemTestnets
								isSelected={configuration.settings.shouldUseTestnets}
								onChange={(isSelected: boolean) => {
									dispatchConfiguration({
										type: 'SET_SETTINGS',
										payload: {
											...configuration.settings,
											shouldUseTestnets: isSelected
										}
									});
								}}
							/>
						</PopoverSettings>
					}
				/>

				<div className={'mt-6 grid gap-4'}>
					<SectionDisplayOwners />
					<SectionDisplayThreshold />
					<SectionDisplayPossibleDeployments />
				</div>
			</div>
		</div>
	);
}

const MultiSafeForm = memo(function MultiSafeForm(): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();
	const [tab, set_tab] = useState(0);

	useUpdateEffect(() => {
		dispatchConfiguration({
			type: 'SET_CONFIG',
			payload: defaulMultiSafetProps.configuration
		});
	}, [tab]);

	return (
		<Fragment>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Do you already have a Safe?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'You can take an existing Safe cross chain or deploy a new one.'}
						</p>
					</div>

					<div className={'col-span-12 mt-6 '}>
						<ViewFlowSelection
							currentTab={tab}
							onChangeTab={set_tab}
						/>
					</div>
				</div>
			</div>

			{tab === 0 ? <CloneSafeForm /> : null}
			{tab === 1 ? <NewSafeForm /> : null}

			{configuration.expectedAddress ? <SafeDeployments /> : null}
			<div className={'h-40'} />
		</Fragment>
	);
});

export default MultiSafeForm;
