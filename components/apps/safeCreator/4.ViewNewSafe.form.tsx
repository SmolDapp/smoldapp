import React from 'react';
import assert from 'assert';
import IconInfo from 'components/icons/IconInfo';
import IconWarning from 'components/icons/IconWarning';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {isZeroAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TNewSafeForm = {
	owners: TAddress[];
	prefix: string;
	set_prefix: Dispatch<SetStateAction<string>>;
	suffix: string;
	set_suffix: Dispatch<SetStateAction<string>>;
	currentSeed: bigint;
	set_currentSeed: Dispatch<SetStateAction<bigint>>;
	factory: 'ssf' | 'ddp';
	set_factory: Dispatch<SetStateAction<'ssf' | 'ddp'>>;
	onGenerate: VoidFunction;
	isLoadingSafes: boolean;
	shouldCancel: React.MutableRefObject<boolean>;
};
function NewSafeExpertForm(props: TNewSafeForm): ReactElement {
	return (
		<form
			onSubmit={async (e): Promise<void> => e.preventDefault()}
			className={'items-center justify-between gap-4 md:gap-6'}>
			<div>
				<div className={'grid grid-cols-3 gap-x-6 gap-y-4'}>
					<div aria-label={'prefix-selection'}>
						<div className={'pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Prefix'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>
												{
													'These are the letters and numbers at the beginning of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
												}
											</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									autoFocus
									onChange={(e): void => {
										const {value} = e.target;
										if (value.length <= 6) {
											if (value.match(/^0x[a-fA-F0-9]{0,6}$/)) {
												props.set_prefix(value);
											} else if (value.match(/^[a-fA-F0-9]{0,4}$/) && !value.startsWith('0x')) {
												props.set_prefix(`0x${value}`);
											}
										}
									}}
									type={'text'}
									value={props.prefix}
									pattern={'^0x[a-fA-F0-9]{0,6}$'}
									className={'smol--input font-mono font-bold'}
								/>
							</div>
						</div>
					</div>
					<div aria-label={'suffix-selection'}>
						<div className={'pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Suffix'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>
												{
													'These are the letters and numbers at the end of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
												}
											</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									onChange={(e): void => {
										const {value} = e.target;
										if (value.length <= 4) {
											if (value.match(/^[a-fA-F0-9]{0,4}$/)) {
												props.set_suffix(value);
											}
										}
									}}
									type={'text'}
									value={props.suffix}
									pattern={'[a-fA-F0-9]{0,6}$'}
									className={'smol--input font-mono font-bold'}
								/>
							</div>
						</div>
					</div>
					<div aria-label={'factory-selection'}>
						<div className={'pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Factory'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>
												{'This is the factory contract that will be used to deploy your Safe.'}
											</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<select
									className={'smol--input font-mono font-bold'}
									value={props.factory}
									onChange={(e): void => {
										assert(['ssf', 'ddp'].includes(e.target.value));
										props.set_factory(e.target.value as 'ssf' | 'ddp');
									}}>
									<option value={'ssf'}>{'Safe Singleton Factory'}</option>
									<option value={'ddp'}>{'Deterministic Deployment Proxy'}</option>
								</select>
							</div>
						</div>
					</div>

					<div
						aria-label={'seed'}
						className={'col-span-3'}>
						<div
							className={'mb-4 mt-1'}
							style={{display: props.prefix.length + props.suffix.length > 5 ? 'flex' : 'none'}}>
							<div
								className={
									'flex flex-row whitespace-pre rounded-md border border-orange-200 !bg-orange-200/60 p-2 text-xs font-bold text-orange-600'
								}>
								<IconWarning className={'mr-2 h-4 w-4 text-orange-600'} />
								{
									'The more characters you add, the longer it will take to find a safe (which can be hours).'
								}
							</div>
						</div>
						<div className={'mt-1 pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Seed'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>{'This is a numeric value that determines the address of your safe.'}</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									onChange={(e): void => {
										const {value} = e.target;
										props.set_currentSeed(BigInt(value.replace(/\D/g, '')));
									}}
									type={'text'}
									value={props.currentSeed.toString()}
									pattern={'[0-9]{0,512}$'}
									className={'smol--input font-number font-bold'}
								/>
							</div>
						</div>
					</div>

					<div className={'col-span-3 mt-2 flex justify-end'}>
						<Button
							className={'group w-auto md:min-w-[160px]'}
							isBusy={props.isLoadingSafes}
							isDisabled={props.owners.some((owner): boolean => !owner || isZeroAddress(owner))}
							onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
								e.currentTarget.blur();
								props.onGenerate();
							}}>
							<p>{'Generate'}</p>
							{props.isLoadingSafes ? (
								<span
									onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
										e.currentTarget.blur();
										props.shouldCancel.current = true;
									}}
									className={
										'absolute inset-0 z-50 flex items-center justify-center transition-colors hover:cursor-pointer hover:bg-neutral-900 hover:!text-neutral-0'
									}>
									<p>{'Cancel'}</p>
								</span>
							) : null}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}

function NewSafeStandardForm(props: TNewSafeForm): ReactElement {
	return (
		<form
			onSubmit={async (e): Promise<void> => e.preventDefault()}
			className={'items-center justify-between gap-4 md:gap-6'}>
			<div>
				<div className={'grid grid-cols-3 gap-x-6 gap-y-2'}>
					<div aria-label={'prefix-selection'}>
						<div className={'pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Prefix'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>
												{
													'These are the letters and numbers at the beginning of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
												}
											</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									autoFocus
									onChange={(e): void => {
										const {value} = e.target;
										if (value.length <= 6) {
											if (value.match(/^0x[a-fA-F0-9]{0,6}$/)) {
												props.set_prefix(value);
											} else if (value.match(/^[a-fA-F0-9]{0,4}$/) && !value.startsWith('0x')) {
												props.set_prefix(`0x${value}`);
											}
										}
									}}
									type={'text'}
									value={props.prefix}
									pattern={'^0x[a-fA-F0-9]{0,6}$'}
									className={'smol--input font-mono font-bold'}
								/>
							</div>
						</div>
					</div>
					<div aria-label={'suffix-selection'}>
						<div className={'pb-2 text-xs text-neutral-600'}>
							<div className={'flex w-fit flex-row items-center space-x-1'}>
								<small className={'font-semibold'}>{'Suffix'}</small>
								<span className={'tooltip'}>
									<IconInfo className={'h-3 w-3 text-neutral-500'} />
									<span className={'tooltipLight top-full mt-1'}>
										<div
											className={
												'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'
											}>
											<p>
												{
													'These are the letters and numbers at the end of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
												}
											</p>
										</div>
									</span>
								</span>
							</div>
						</div>
						<div className={'box-0 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									onChange={(e): void => {
										const {value} = e.target;
										if (value.length <= 4) {
											if (value.match(/^[a-fA-F0-9]{0,4}$/)) {
												props.set_suffix(value);
											}
										}
									}}
									type={'text'}
									value={props.suffix}
									pattern={'[a-fA-F0-9]{0,6}$'}
									className={'smol--input font-mono font-bold'}
								/>
							</div>
						</div>
					</div>
					<div>
						<p className={'font-inter pb-2 text-xs font-semibold text-neutral-600'}>&nbsp;</p>
						<Button
							className={'group w-full'}
							isBusy={props.isLoadingSafes}
							isDisabled={props.owners.some((owner): boolean => !owner || isZeroAddress(owner))}
							onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
								e.currentTarget.blur();
								props.onGenerate();
							}}>
							<p>{'Generate'}</p>
							{props.isLoadingSafes ? (
								<span
									onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
										e.currentTarget.blur();
										props.shouldCancel.current = true;
									}}
									className={
										'absolute inset-0 z-50 flex items-center justify-center transition-colors hover:cursor-pointer hover:bg-neutral-900 hover:!text-neutral-0'
									}>
									<p>{'Cancel'}</p>
								</span>
							) : null}
						</Button>
					</div>
					<div className={'col-span-2'}>
						<div
							className={'mt-1'}
							style={{display: props.prefix.length + props.suffix.length > 5 ? 'flex' : 'none'}}>
							<div
								className={
									'flex flex-row whitespace-pre rounded-md border border-orange-200 !bg-orange-200/60 p-2 text-xs font-bold text-orange-600'
								}>
								<IconWarning className={'mr-2 h-4 w-4 text-orange-600'} />
								{
									'The more characters you add, the longer it will take to find a safe (which can be hours).'
								}
							</div>
						</div>
						<div className={'mt-0'}>
							<p
								className={
									'font-number max-w-[100%] break-all text-xxs text-neutral-400 md:whitespace-pre md:break-normal'
								}>
								{`Seed: ${props.currentSeed.toString()}`}
							</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}

export {NewSafeExpertForm, NewSafeStandardForm};
