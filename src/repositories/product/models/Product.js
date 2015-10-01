var mongoose = module.require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');
var moment = module.require('moment');

// var ProductSearch = module.require('./ProductSearch');
var RelatedProduct = module.require('./RelatedProduct');
var CategoryPathPart = module.require('./CategoryPathPart');
var IncludedItem = module.require('./IncludedItem');
// var ProductShippingCosts = module.require('./ProductShippingCosts');

var schemaTemplate = {
    _id: Number,
    name: String,
    keywords: Array,
    lastUpdated: Date,
    identifiers: {
        sku: Number,
        productId: Number,
        upc: String,
        modelNumber: String,
        manufacturer: String,
        color: String
    },
    descriptions: {
        description: String,
        shortDescription: String,
        longDescription: String,
        condition: String
    },
    misc: {
        categoryPath: [CategoryPathPart],
        productTemplate: String,
        lists: [],
        format: String,
        includedItemList: [IncludedItem],
        isIphoneAccessory: Boolean,
        bundledIn: [],
        type: String
    },
    marketplace: {
        isMarketplaceItem: Boolean,
        listingId: String,
        sellerId: String
    },
    classes: {
        class: String,
        classId: Number,
        subclass: String,
        subclassId: Number,
        department: String,
        departmentId: Number
    },
    pricing: {
        hasLowPriceGuarantee: Boolean,
        activeUpdateDate: Date,
        regularPrice: Number,
        salePrice: Number,
        isOnSale: Boolean,
        planPrice: Number,
        priceWithPlan: [],
        priceRestriction: String,
        priceUpdateDate: Date,
        tradeInValue: String
    },
    media: {
        isDigital: Boolean,
        isPreowned: Boolean
    },
    cellular: {
        carrierPlans: [],
        technologyCode: String,
        carrierModelNumber: String,
        earlyTerminationFees: []
    },
    related: {
        frequentlyPurchasedWith: [],
        accessories: [],
        relatedProducts: [RelatedProduct]
    },
    plans: {
        techSupportPlans: [],
        buybackPlans: [],
        protectionPlans: [],
        productFamilies: []
    },
    ranking: {
        salesRankShortTerm: Number,
        salesRankMediumTerm: Number,
        salesRankLongTerm: Number,
        bestSellingRank: Number
    },
    urls: {
        url: String,
        spin360Url: String,
        mobileUrl: String,
        affiliateUrl: String,
        addToCartUrl: String,
        affiliateAddToCartUrl: String,
        linkShareAffiliateUrl: String,
        linkShareAffiliateAddToCartUrl: String
    },
    images: {
        image: String,
        largeFrontImage: String,
        mediumImage: String,
        thumbnailImage: String,
        largeImage: String,
        alternateViewsImage: String,
        angleImage: String,
        backViewImage: String,
        energyGuideImage: String,
        leftViewImage: String,
        accessoriesImage: String,
        remoteControlImage: String,
        rightViewImage: String,
        topViewImage: String
    },
    reviews: {
        customerReviewCount: Number,
        customerReviewAverage: String,
        isCustomerTopRated: Boolean
    },
    availability: {
        source: String,
        startDate: String,
        isNew: Boolean,
        isActive: Boolean,
        releaseDate: String,
        hasFreeShipping: Boolean,
        isFreeShippingEligible: Boolean,
        shipping: [],
        shippingCost: Number,
        isSpecialOrder: Boolean,
        hasInStorePickup: Boolean,
        hasFriendsAndFamilyPickup: Boolean,
        hasHomeDelivery: Boolean,
        quantityLimit: Number,
        fulfilledBy: String,
        orderable: String,
        hasInStoreAvailability: Boolean,
        inStoreAvailabilityText: String,
        inStoreAvailabilityUpdateDate: Date,
        itemUpdateDate: Date,
        hasOnlineAvailability: Boolean,
        onlineAvailabilityText: String,
        onlineAvailabilityUpdateDate: String,
        shippingRestrictions: String
    },
    savings: {
        dollarSavings: Number,
        percentSavings: String
    },
    measurements: {
        height: String,
        width: String,
        depth: String,
        weight: String,
        shippingWeight: String
    },
    warranty: {
        warrantyLabor: String,
        warrantyParts: String
    }
};
var productSchema = new Schema(schemaTemplate, {
    collection: 'products',
    index: { sku: -1 },
    autoIndex: false
});

productSchema.methods.updateLastModified = function() {
    this.lastUpdated = moment().toDate();

    // return this for chaining;
    return this;
};
productSchema.methods.generateKeywords = function() {
    var keywordsOut = [];

    var getTokens = function(input){
        return _.clone(input)
            // Replace special characters
            .replace(/[&]/g, '')

            // Replace non-word characters
            .replace(/[\W]/g, ' ')

            // Replace multiple spaces with one space
            .replace(/\s{2,}/g, ' ')

            .toLowerCase()

            // tokenize string with comma delimiters
            .replace(/\s/g, ',')
            .split(',');
    }.bind(this);

    // Use components of name as keywords
    if (!_.isEmpty(this.name)){
        var tokens = getTokens(this.name);
        keywordsOut = _.union(keywordsOut, tokens);
    }

    // Use Manufacturer as Keyword
    if (!_.isEmpty(this.identifiers.manufacturer)){
        var tokens = getTokens(this.identifiers.manufacturer);
        keywordsOut = _.union(keywordsOut, tokens);
    }

    // Use Model number as Keyword
    if (!_.isEmpty(this.identifiers.modelNumber)){
        var tokens = getTokens(this.identifiers.modelNumber);
        keywordsOut = _.union(keywordsOut, tokens);
    }

    // Use UPC as Keyword
    if (!_.isEmpty(this.identifiers.upc)){
        var tokens = getTokens(this.identifiers.upc);
        keywordsOut = _.union(keywordsOut, tokens);
    }

    // Use SKU as Keyword
    if (!_.isEmpty(this.identifiers.sku)){
        var tokens = getTokens(this.identifiers.sku);
        keywordsOut = _.union(keywordsOut, tokens);
    }

    this.keywords = keywordsOut;

    // return this for chaining.
    return this;
};

var Product = mongoose.model('Product', productSchema);
module.exports = Product;