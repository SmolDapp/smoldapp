'use client';

import * as React from 'react';
import {IconChevronBoth} from '@icons/IconChevronBoth';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from './Commands';
import {Popover, PopoverContent, PopoverTrigger} from './Popover';

const frameworks = [
	{
		value: 'next.js',
		label: 'Next.js'
	},
	{
		value: 'sveltekit',
		label: 'SvelteKit'
	},
	{
		value: 'nuxt.js',
		label: 'Nuxt.js'
	},
	{
		value: 'remix',
		label: 'Remix'
	},
	{
		value: 'astro',
		label: 'Astro'
	}
];

export function ComboboxDemo(): React.ReactElement {
	const [isOpen, set_isOpen] = React.useState(false);
	const [value, set_value] = React.useState('');

	return (
		<Popover
			open={isOpen}
			onOpenChange={set_isOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					role={'combobox'}
					className={'w-[200px] justify-between'}>
					<>
						{value ? frameworks.find(framework => framework.value === value)?.label : 'Select framework...'}
						<IconChevronBoth className={'ml-2 h-4 w-4 shrink-0 opacity-50'} />
					</>
				</Button>
			</PopoverTrigger>
			<PopoverContent className={'w-[200px] p-0'}>
				<Command>
					<CommandInput placeholder={'Search framework...'} />
					<CommandEmpty>{'No framework found.'}</CommandEmpty>
					<CommandGroup>
						{frameworks.map(framework => (
							<CommandItem
								key={framework.value}
								value={framework.value}
								onSelect={currentValue => {
									set_value(currentValue === value ? '' : currentValue);
									set_isOpen(false);
								}}>
								<IconCircleCheck
									className={cl(
										'mr-2 h-4 w-4',
										value === framework.value ? 'opacity-100' : 'opacity-0'
									)}
								/>
								{framework.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
