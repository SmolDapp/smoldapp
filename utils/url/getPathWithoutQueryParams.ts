/**
 * Strips the query params from a URL if present
 */
export function getPathWithoutQueryParams(path: string): string {
	const pathParts = path.split('?');
	return pathParts[0];
}
