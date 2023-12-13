/******************************************************************************
 ** Returns the specified percentage of a value.
 ** Handles floating point precision errors by using a multiplier to work on integers
 *****************************************************************************/
export const percentOf = (value: number, percentage: number, precision = 12): number => {
	const multiplier = Math.pow(10, precision);
	const multipliedValue = value * multiplier;

	const multipliedResult = (multipliedValue / 100) * percentage;

	const result = multipliedResult / multiplier;

	// In case the multiplier causes the number to be too large for JS to handle, return a basic percent value as fallback
	if (Number.isNaN(result)) {
		return (value / 100) * percentage;
	}

	return result;
};
