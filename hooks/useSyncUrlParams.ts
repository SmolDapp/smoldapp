import {useRouter} from 'next/router';
import {useDeepCompareEffect} from '@react-hookz/web';
import {getPathWithoutQueryParams} from '@utils/url/getPathWithoutQueryParams';
import {serializeSearchStateForUrl} from '@utils/url/serializeStateForUrl';

export function useSyncUrlParams(
	state: {[key: string]: unknown},
	options?: {
		/**
		 * These keys will always be serialized, even if they have a falsy value.
		 */
		forceSerializeKeys: string[];
	}
): void {
	const {forceSerializeKeys = []} = options ?? {};

	const router = useRouter();
	useDeepCompareEffect(() => {
		router.push(
			{
				pathname: getPathWithoutQueryParams(router.asPath),
				query: serializeSearchStateForUrl({...state}, forceSerializeKeys)
			},
			undefined,
			{
				scroll: false,
				shallow: true
			}
		);
	}, [forceSerializeKeys, router.isReady, state]);
}

// import {useCallback, useState} from 'react';
// import {useSearchParams} from 'next/navigation';

// import type {TDict} from '@yearn-finance/web-lib/types';

// type TQueryArgs = {

// 		to: string('to'),
// 		tokens: array('tokens'),
// 		values: array('values')

// 	search: string | null | undefined;
// 	categories: string[] | null;
// 	chains: number[] | null;
// 	sortDirection: TSortDirection;
// 	sortBy: TPossibleSortBy;
// 	onSearch: (value: string) => void;
// 	onChangeCategories: (value: string[] | null) => void;
// 	onChangeChains: (value: number[] | null) => void;
// 	onChangeSortDirection: (value: TSortDirection | '') => void;
// 	onChangeSortBy: (value: TPossibleSortBy | '') => void;
// 	onReset: () => void;
// };
// function useQueryArguments({defaultCategories}: {defaultCategories?: string[]}): TQueryArgs {
// 	const allChains = useSupportedChains().map((chain): number => chain.id);
// 	const searchParams = useSearchParams();
// 	const router = useRouter();
// 	const [search, set_search] = useState<string | null>(null);
// 	const [categories, set_categories] = useState<string[] | null>(defaultCategories || []);
// 	const [chains, set_chains] = useState<number[] | null>(allChains || []);
// 	const [sortDirection, set_sortDirection] = useState<string | null>(null);
// 	const [sortBy, set_sortBy] = useState<string | null>(null);

// 	const handleQuery = useCallback(
// 		(_searchParams: URLSearchParams): void => {
// 			if (_searchParams.has('search')) {
// 				const _search = _searchParams.get('search');
// 				if (_search === null) {
// 					return;
// 				}
// 				set_search(_search);
// 			}

// 			if (_searchParams.has('categories')) {
// 				const categoriesParam = _searchParams.get('categories');
// 				const categoriesParamArray = categoriesParam?.split('_') || [];
// 				if (categoriesParamArray.length === 0) {
// 					set_categories(defaultCategories || []);
// 					return;
// 				}
// 				if (categoriesParamArray.length === defaultCategories?.length) {
// 					const isEqual = categoriesParamArray.every((c): boolean => defaultCategories?.includes(c));
// 					if (isEqual) {
// 						set_categories(defaultCategories);
// 						return;
// 					}
// 				}
// 				if (categoriesParamArray[0] === 'none') {
// 					set_categories([]);
// 					return;
// 				}
// 				set_categories(categoriesParamArray);
// 			} else {
// 				set_categories(defaultCategories || []);
// 			}

// 			if (_searchParams.has('chains')) {
// 				const chainsParam = _searchParams.get('chains');
// 				const chainsParamArray = chainsParam?.split('_') || [];
// 				if (chainsParamArray.length === 0) {
// 					set_chains(allChains);
// 					return;
// 				}
// 				if (chainsParamArray.length === allChains.length) {
// 					const isEqual = chainsParamArray.every((c): boolean => allChains.includes(Number(c)));
// 					if (isEqual) {
// 						set_chains(allChains);
// 						return;
// 					}
// 				}
// 				if (chainsParamArray[0] === '0') {
// 					set_chains([]);
// 					return;
// 				}
// 				set_chains(chainsParamArray.map((chain): number => Number(chain)));
// 			} else {
// 				set_chains(allChains);
// 			}

// 			if (_searchParams.has('sortDirection')) {
// 				const _sortDirection = _searchParams.get('sortDirection');
// 				if (_sortDirection === null) {
// 					return;
// 				}
// 				set_sortDirection(_sortDirection);
// 			}

// 			if (_searchParams.has('sortBy')) {
// 				const _sortBy = _searchParams.get('sortBy');
// 				if (_sortBy === null) {
// 					return;
// 				}
// 				set_sortDirection(_sortBy);
// 			}
// 		},
// 		[defaultCategories, allChains]
// 	);

// 	useMountEffect((): void | VoidFunction => {
// 		const currentPage = new URL(window.location.href);
// 		handleQuery(new URLSearchParams(currentPage.search));
// 	});

// 	useDeepCompareEffect((): void | VoidFunction => {
// 		handleQuery(searchParams);
// 	}, [searchParams]);

// 	return {
// 		search,
// 		categories: (categories || []) as string[],
// 		chains: (chains || []) as number[],
// 		sortDirection: (sortDirection || 'desc') as TSortDirection,
// 		sortBy: (sortBy || 'featuringScore') as TPossibleSortBy,
// 		onSearch: (value): void => {
// 			set_search(value);
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (key !== 'search') {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}

// 			if (value === '') {
// 				queryArgs.search = undefined;
// 				delete queryArgs.search;
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			queryArgs.search = value;
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		},
// 		onChangeCategories: (value): void => {
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (key !== 'categories') {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}

// 			set_categories(value);
// 			if (value === null) {
// 				queryArgs.categories = 'none';
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			if (value.length === 0) {
// 				queryArgs.categories = 'none';
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			if (value.length === defaultCategories?.length) {
// 				const isEqual = value.every((category): boolean => defaultCategories?.includes(category));
// 				if (isEqual) {
// 					queryArgs.categories = undefined;
// 					delete queryArgs.categories;
// 					router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});

// 					return;
// 				}
// 			}
// 			queryArgs.categories = value.join('_');
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		},
// 		onChangeChains: (value): void => {
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (key !== 'chains') {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}
// 			set_chains(value);
// 			if (value === null) {
// 				queryArgs.chains = '0';
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			if (value.length === 0) {
// 				queryArgs.chains = '0';
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			if (value.length === allChains.length) {
// 				const isEqual = value.every((chain): boolean => allChains.includes(chain));
// 				if (isEqual) {
// 					queryArgs.chains = undefined;
// 					delete queryArgs.chains;
// 					router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 					return;
// 				}
// 			}
// 			queryArgs.chains = value.join('_');
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		},
// 		onChangeSortDirection: (value): void => {
// 			set_sortDirection(value);
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (key !== 'sortDirection') {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}

// 			if (value === '') {
// 				queryArgs.sortDirection = undefined;
// 				delete queryArgs.sortDirection;
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			queryArgs.sortDirection = value;
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		},
// 		onChangeSortBy: (value): void => {
// 			set_sortBy(value);
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (key !== 'sortBy') {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}

// 			if (value === '') {
// 				queryArgs.sortBy = undefined;
// 				delete queryArgs.sortBy;
// 				router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 				return;
// 			}
// 			queryArgs.sortBy = value;
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		},
// 		onReset: (): void => {
// 			set_search(null);
// 			set_categories(defaultCategories || []);
// 			set_chains(allChains || []);
// 			set_sortDirection('desc');
// 			set_sortBy('featuringScore');
// 			const queryArgs: TDict<string | string[] | undefined> = {};
// 			for (const key in router.query) {
// 				if (
// 					key !== 'search' &&
// 					key !== 'categories' &&
// 					key !== 'chains' &&
// 					key !== 'sortDirection' &&
// 					key !== 'sortBy'
// 				) {
// 					queryArgs[key] = router.query[key];
// 				}
// 			}
// 			router.replace({pathname: router.pathname, query: queryArgs}, undefined, {shallow: true});
// 		}
// 	};
// }

// export {useQueryArguments};
