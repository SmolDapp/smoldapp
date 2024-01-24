import {useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {format, isAfter, isBefore} from 'date-fns';
import {cl} from '@builtbymom/web3/utils';
import * as Popover from '@radix-ui/react-popover';

import {Calendar} from './Calendar';

import type {ChangeEventHandler, ReactElement} from 'react';

type TDatePicker = {
	date: Date | undefined;
	startDate?: Date;
	endDate?: Date;
	onChangeDate: (date: Date | undefined) => void;
};
export function DatePicker({date, onChangeDate, startDate, endDate}: TDatePicker): ReactElement {
	const [isOpen, set_isOpen] = useState<boolean>(false);
	const [timeValue, set_timeValue] = useState<string>('00:00');

	const handleTimeChange: ChangeEventHandler<HTMLInputElement> = e => {
		const time = e.target.value;
		if (!date) {
			set_timeValue(time);
			return;
		}
		const [hours, minutes] = time.split(':').map(str => parseInt(str, 10));
		const newSelectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
		onChangeDate(newSelectedDate);
		set_timeValue(time);
	};

	return (
		<>
			<div
				onClick={() => set_isOpen(false)}
				className={cl(
					'fixed inset-0 z-40 transition-colors',
					isOpen ? 'bg-neutral-900/10 backdrop-blur-[1px]' : 'bg-neutral-900/0 pointer-events-none'
				)}
			/>
			<Popover.Root open={isOpen}>
				<Popover.Trigger asChild>
					<button
						onClick={() => set_isOpen(o => !o)}
						className={cl('smol--input-wrapper text-sm', !date ? 'text-neutral-600/60' : '')}>
						{date ? format(date, "dd/MM/yyyy 'at' HH:mm") : <span>{'Pick a date'}</span>}
					</button>
				</Popover.Trigger>
				<Popover.Content
					onInteractOutside={() => set_isOpen(false)}
					className={'w-auto p-0'}
					align={'start'}>
					<Calendar
						initialFocus
						mode={'single'}
						defaultMonth={date}
						selected={date}
						onSelect={onChangeDate}
						captionLayout={'dropdown-buttons'}
						disabled={(date): boolean => {
							if (startDate) {
								return isBefore(date, startDate);
							}
							if (endDate) {
								return isAfter(date, endDate);
							}
							return false;
						}}
						fromDate={startDate}
						toDate={endDate}
						fromYear={new Date().getFullYear()}
						toYear={new Date().getFullYear() + 10}
						numberOfMonths={1}
						footer={
							<div>
								<div className={'mt-4 flex items-center gap-4 border-t-2 border-neutral-200 pt-4'}>
									<p className={'text-sm font-medium'}>{'Time:'}</p>
									<input
										type={'time'}
										className={cl(
											'w-full rounded-md border border-neutral-200 bg-neutral-0 px-2 py-1.5 text-sm',
											'outline-none outline-transparent !ring-transparent !ring-0 focus:border-primary-500 transition-colors'
										)}
										value={timeValue}
										onChange={handleTimeChange}
									/>
								</div>
								<Button
									onClick={() => set_isOpen(false)}
									className={'mt-4 !h-10 w-full'}>
									{'Confirm'}
								</Button>
							</div>
						}
					/>
				</Popover.Content>
			</Popover.Root>
		</>
	);
}
