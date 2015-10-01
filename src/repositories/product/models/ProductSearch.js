var ProductResult = require('./ProductResult');

var ProductSearch = {
    /** Start of products shown (pagination) */
    from: Number,
    /** End of products shown (pagination) */
    to: Number,
    /** Total number of products */
    total: Number,
    currentPage: Number,
    totalPages: Number,
    queryTime: String,
    totalTime: String,
    partial: Boolean,

    /** Search URL used
     * @private
     */
    canonicalUrl: String,

    /** Products Returned */
    products: ProductResult
};
module.exports = ProductSearch;