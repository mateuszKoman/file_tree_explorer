const UNITS = ['KB', 'MB', 'GB']
const ROUNDS_TO_1024 = 1023.95

export function formatSize(bytes: number): string {
    if (Math.round(bytes) < 1024) return `${Math.round(bytes)} B`
    let value = bytes / 1024
    let unit = 0
    while (value >= ROUNDS_TO_1024 && unit < UNITS.length - 1) {
        value /= 1024
        unit++
    }
    return `${value.toFixed(1)} ${UNITS[unit]}`
}
