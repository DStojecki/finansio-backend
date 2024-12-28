export function calculatePercentageChange(initialValue: number, finalValue: number): number {
    if (initialValue === 0) {
        throw new Error('Initial value cannot be zero.')
    }
    return +(((finalValue - initialValue) / initialValue) * 100).toFixed(2)
}