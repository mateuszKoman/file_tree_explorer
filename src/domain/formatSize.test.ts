import {describe, expect, it} from 'vitest'
import {formatSize} from './formatSize.ts'

describe('formatSize', () => {
    it.each([
        [0, '0 B'],
        [1, '1 B'],
        [512, '512 B'],
        [1023, '1023 B'],
    ])('shows %d bytes without decimals as %j', (bytes, expected) => {
        expect(formatSize(bytes)).toBe(expected)
    })

    it.each([
        [1.4, '1 B'],
        [1023.7, '1.0 KB'],
    ])('rounds the fractional size %d to %j', (bytes, expected) => {
        expect(formatSize(bytes)).toBe(expected)
    })

    it.each([
        [1024, '1.0 KB'],
        [1536, '1.5 KB'],
        [10_240, '10.0 KB'],
        [1_048_575, '1.0 MB'],
        [1_048_576, '1.0 MB'],
        [5_767_168, '5.5 MB'],
    ])('shows %d bytes with one decimal as %j', (bytes, expected) => {
        expect(formatSize(bytes)).toBe(expected)
    })

    it.each([
        [1_073_741_823, '1.0 GB'],
        [1_073_741_824, '1.0 GB'],
        [5_368_709_120, '5.0 GB'],
        [2_199_023_255_552, '2048.0 GB'],
    ])('shows %d bytes (>= 1024 MB) in GB as %j', (bytes, expected) => {
        expect(formatSize(bytes)).toBe(expected)
    })
})
