import React, {useEffect, useState} from 'react';
import {Button} from '@yearn-finance/web-lib/components/Button';

import type {ChangeEvent, ReactElement, ReactNode} from 'react';

export type TListHeroCategory<T> = {
	label: string;
	node?: ReactNode;
	value: T;
	isSelected?: boolean,
}

export type TListHero<T> = {
	headLabel: string;
	searchLabel: string;
	searchPlaceholder: string;
	categories?: TListHeroCategory<T>[][];
	onSelect?: (category: T) => void;
	searchValue: string;
	set_searchValue: (searchValue: string) => void;
}

export type TListHeroSearchBar = {
	searchLabel: string;
	searchPlaceholder: string;
	searchValue: string;
	set_searchValue: (searchValue: string) => void;
}

export type TListHeroDesktopCategories<T> = {
	categories: TListHeroCategory<T>[][];
	onSelect: (category: T) => void;
}

function	SearchBar({searchLabel, searchPlaceholder, searchValue, set_searchValue}: TListHeroSearchBar): ReactElement {
	return (
		<div className={'w-full'}>
			<label htmlFor={'search'} className={'text-neutral-600'}>{searchLabel}</label>
			<div className={'mt-1 flex h-10 w-full max-w-md items-center border border-neutral-0 bg-neutral-0 p-2 md:w-2/3'}>
				<div className={'relative flex h-10 w-full flex-row items-center justify-between'}>
					<input
						id={'search'}
						className={'h-10 w-full overflow-x-scroll border-none bg-transparent py-2 px-0 text-base outline-none scrollbar-none placeholder:text-neutral-400'}
						type={'text'}
						placeholder={searchPlaceholder}
						value={searchValue}
						onChange={(e: ChangeEvent<HTMLInputElement>): void => {
							if (set_searchValue) {
								set_searchValue(e.target.value);
							}
						}} />
					<div className={'absolute right-0 text-neutral-400'}>
						<svg
							width={'20'}
							height={'20'}
							viewBox={'0 0 24 24'}
							fill={'none'}
							xmlns={'http://www.w3.org/2000/svg'}>
							<path
								fillRule={'evenodd'}
								clipRule={'evenodd'}
								d={'M10 1C5.02972 1 1 5.02972 1 10C1 14.9703 5.02972 19 10 19C12.1249 19 14.0779 18.2635 15.6176 17.0318L21.2929 22.7071C21.6834 23.0976 22.3166 23.0976 22.7071 22.7071C23.0976 22.3166 23.0976 21.6834 22.7071 21.2929L17.0318 15.6176C18.2635 14.0779 19 12.1249 19 10C19 5.02972 14.9703 1 10 1ZM3 10C3 6.13428 6.13428 3 10 3C13.8657 3 17 6.13428 17 10C17 13.8657 13.8657 17 10 17C6.13428 17 3 13.8657 3 10Z'}
								fill={'currentcolor'}/>
						</svg>
					</div>

				</div>
			</div>
		</div>
	);
}

function	DesktopCategories<T>({categories, onSelect}: TListHeroDesktopCategories<T>): ReactElement {
	const	[isClientLoaded, set_isClientLoaded] = useState(false);
	useEffect((): void => {
		set_isClientLoaded(true);
	}, []);

	return (
		<div>
			<label className={'text-neutral-600'}>&nbsp;</label>
			<div className={'mt-1 flex flex-row space-x-4'}>
				{(categories || []).map((currentCategory, index: number): ReactElement => (
					<div
						key={`${index}-${isClientLoaded}`}
						className={'flex flex-row space-x-0 divide-x border-x border-neutral-900'}>
						{currentCategory.map((item): ReactElement => (
							<Button
								key={item.label}
								onClick={(): void => onSelect(item.value)}
								variant={item.isSelected ? 'filled' : 'outlined'}
								className={'yearn--button-smaller relative !border-x-0'}>
								{item?.node || item.label}
							</Button>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

function	ListHero<T extends string>({
	headLabel,
	searchLabel,
	searchPlaceholder,
	categories,
	onSelect,
	searchValue,
	set_searchValue
}: TListHero<T>): ReactElement {
	return (
		<div className={'flex flex-col items-start justify-between space-x-0 px-4 pt-4 pb-2 md:px-10 md:pt-10 md:pb-8'}>
			<div className={'mb-6'}>
				<h2 suppressHydrationWarning className={'text-lg font-bold md:text-3xl'}>{headLabel}</h2>
			</div>

			<div className={'hidden w-full flex-row items-center justify-between space-x-4 md:flex'}>
				<SearchBar
					searchLabel={searchLabel}
					searchPlaceholder={searchPlaceholder}
					searchValue={searchValue}
					set_searchValue={set_searchValue} />

				{(categories && onSelect) && <DesktopCategories
					categories={categories}
					onSelect={onSelect} />}
			</div>

			<div className={'flex w-full flex-row space-x-2 md:hidden md:w-2/3'}>
				{(categories && onSelect) && (
					<select
						className={'yearn--button-smaller !w-[120%] border-none bg-neutral-900 text-neutral-0'}
						onChange={({target: {value}}): void => onSelect(value as T)}>
						{(categories || [])?.map((currentCategory): ReactNode => (
							currentCategory.map((item): ReactElement => (
								<option key={item.value as string} value={item.value as string}>
									{item.label}
								</option>
							))
						))}
					</select>
				)}
				<div className={'flex h-8 w-full items-center border border-neutral-0 bg-neutral-0 p-2 md:w-auto'}>
					<div className={'flex h-8 w-full flex-row items-center justify-between py-2 px-0'}>
						<input
							className={'w-full overflow-x-scroll border-none bg-transparent py-2 px-0 text-xs outline-none scrollbar-none'}
							type={'text'}
							placeholder={'Search'}
							value={searchValue}
							onChange={(e: ChangeEvent<HTMLInputElement>): void => set_searchValue(e.target.value)} />
					</div>
				</div>
			</div>
		</div>
	);
}
export default ListHero;
