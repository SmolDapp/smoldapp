import React, {useCallback} from 'react';
import IconChevronPlain from 'components/icons/IconChevronPlain';

import type {ReactElement} from 'react';

export type TListHead = {
	items: {
		label: string,
		value: string,
		sortable: boolean,
		className?: string
		datatype?: string
	}[],
	wrapperClassName?: string,
	tokenClassName?: string,
	dataClassName?: string,
	sortBy: string,
	sortDirection: string,
	onSort: (sortBy: string, sortDirection: string) => void
}

function	ListHead({items, dataClassName, tokenClassName, wrapperClassName, sortBy, sortDirection, onSort}: TListHead): ReactElement {
	const	renderChevron = useCallback((shouldSortBy: boolean): ReactElement => {
		if (shouldSortBy && sortDirection === 'desc') {
			return <IconChevronPlain className={'yearn--sort-chevron'} />;
		} if (shouldSortBy && sortDirection === 'asc') {
			return <IconChevronPlain className={'yearn--sort-chevron rotate-180'} />;
		}
		return <IconChevronPlain className={'yearn--sort-chevron--off text-neutral-300 group-hover:text-neutral-500'} />;
	}, [sortDirection]);


	const	[first, ...rest] = items;
	return (
		<div className={'grid w-full grid-cols-1 pt-2 md:pt-4'}>
			<div className={`yearn--table-head-wrapper ${wrapperClassName || ''}`}>
				<div className={`yearn--table-head-token-section ${tokenClassName || ''}`}>
					<button
						onClick={(): void => onSort(first.value, sortBy === first.value ? (
							sortDirection === '' ? 'desc' : sortDirection === 'desc' ? 'asc' : ''
						) : 'desc')}
						className={'yearn--table-head-label-wrapper group'}>
						<p className={'yearn--table-head-label'}>
							{first.label}
						</p>
						{renderChevron(sortBy === first.value)}
					</button>
				</div>

				<div className={`yearn--table-head-data-section ${dataClassName || ''}`}>
					{rest.map((item, index): ReactElement => (
						<button
							key={`${index}_${item.value}`}
							onClick={(): void => onSort(item.value, sortBy === item.value ? (
								sortDirection === '' ? 'desc' : sortDirection === 'desc' ? 'asc' : ''
							) : 'desc')}
							disabled={!item.sortable}
							className={`yearn--table-head-label-wrapper group ${item.className}`}
							datatype={item.datatype || 'number'}>
							<p className={'yearn--table-head-label'}>
							&nbsp;{item.label}
							</p>
							{item.sortable ? renderChevron(sortBy === item.value) : null}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export default ListHead;
