export function computePageValue(page: number, count: number, order: number, total: number, currentIndex: number) {
    if (currentIndex >= total - 1) throw Error('anchor must < total - 1')

    const actualTotal = Math.min(count, total)

    const totalDelta = page - currentIndex < 0 ? currentIndex - page
        : page + actualTotal - currentIndex > count ? count + currentIndex - page - actualTotal
            : 0

    return page + order - currentIndex + totalDelta
}