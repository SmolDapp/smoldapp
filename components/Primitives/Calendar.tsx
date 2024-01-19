'use client';

import {Children} from 'react';
import {DayPicker} from 'react-day-picker';
import {cl} from '@builtbymom/web3/utils';
import * as SelectPrimitive from '@radix-ui/react-select';
import {IconChevronBottom} from '@yearn-finance/web-lib/icons/IconChevronBottom';

import {SelectContent, SelectItem, SelectTrigger} from './Select';

export type TCalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: TCalendarProps): React.ReactElement {
	const handleCalendarChange = (_value: string | number, _e: React.ChangeEventHandler<HTMLSelectElement>): void => {
		const _event = {
			target: {
				value: String(_value)
			}
		} as React.ChangeEvent<HTMLSelectElement>;
		_e(_event);
	};

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cl('p-3', className)}
			classNames={{
				months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
				month: 'space-y-4',

				caption_start: 'is-start',
				caption_between: 'is-between',
				caption_end: 'is-end',
				caption: 'flex justify-center pt-1 relative items-center gap-1',
				caption_label: 'flex h-7 text-sm font-medium justify-center items-center grow [.is-multiple_&]:flex',
				caption_dropdowns: 'flex justify-center gap-1 grow dropdowns pl-8 pr-9',
				multiple_months: 'is-multiple',
				vhidden: 'hidden [.is-between_&]:flex [.is-end_&]:flex [.is-start.is-end_&]:hidden',
				nav: "flex items-center [&:has([name='previous-month'])]:order-first [&:has([name='next-month'])]:order-last gap-1",

				nav_button: cl('h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity'),
				nav_button_previous: 'absolute left-0 flex items-center justify-start',
				nav_button_next: 'absolute right-0 flex items-center justify-end',
				table: 'w-full border-collapse space-y-1',
				head_row: 'flex w-full p-0 gap-0.5',
				head_cell: 'text-neutral-600/60 rounded-md w-10 font-normal text-[0.8rem] p-0 text-center',
				row: 'flex w-full mt-0',
				cell: cl(
					'relative text-center text-sm focus-within:relative focus-within:z-20 rounded-md overflow-hidden'
				),
				day: cl('h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-primary-400'),
				day_range_start: 'day-range-start',
				day_range_end: 'day-range-end',
				day_selected:
					'bg-primary-500 text-neutral-0 hover:bg-primary-500 hover:text-neutral-0 focus:bg-primary-500 focus:text-neutral-0 transition-colors',
				day_today: 'bg-neutral-200',
				day_outside:
					'day-outside text-neutral-600/40 aria-selected:bg-accent/50 aria-selected:text-neutral-600/40 aria-selected:opacity-30',
				day_disabled: 'text-neutral-600/40',
				day_hidden: 'invisible',
				...classNames
			}}
			components={{
				IconLeft: ({...props}) => (
					<IconChevronBottom
						{...props}
						className={'size-4 rotate-90'}
					/>
				),
				IconRight: ({...props}) => (
					<IconChevronBottom
						{...props}
						className={'size-4 -rotate-90 text-right'}
					/>
				),
				Dropdown: ({...props}) => (
					<SelectPrimitive.Root
						{...props}
						onValueChange={value => {
							if (props.onChange) {
								handleCalendarChange(value, props.onChange);
							}
						}}
						value={props.value as string}>
						<SelectTrigger
							className={cl(
								'', //ghost
								'pl-2 pr-1 py-2 h-7 w-fit font-medium [.is-between_&]:hidden [.is-end_&]:hidden [.is-start.is-end_&]:flex'
							)}>
							<SelectPrimitive.Value placeholder={props?.caption as string}>
								{props?.caption}
							</SelectPrimitive.Value>
						</SelectTrigger>
						<SelectContent
							className={
								'scrolling-auto max-h-[var(--radix-popper-available-height);] min-w-[var(--radix-popper-anchor-width)] overflow-y-auto'
							}>
							{props.children &&
								Children.map(props.children, child => (
									<SelectItem
										value={(child as React.ReactElement)?.props?.value}
										className={'min-w-[var(--radix-popper-anchor-width)]'}>
										{(child as React.ReactElement)?.props?.children}
									</SelectItem>
								))}
						</SelectContent>
					</SelectPrimitive.Root>
				)
			}}
			{...props}
		/>
	);
}
Calendar.displayName = 'Calendar';
