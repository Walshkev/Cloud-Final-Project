//copied from Alex's project 8 on 6/8/25
const paginate = (items, page, pageSize) => {
    const pageStart = pageSize * (Math.max(page-1, 0))
    const pageEnd = pageStart + pageSize

    return items.slice(pageStart, pageEnd)
}

module.exports = {
    paginate
}