class Listing {
  final String id;
  final String tenantId;
  final String authorId;
  final String listingType;
  final String? categoryId;
  final String title;
  final String? description;
  final String? shortDescription;
  final List<Map<String, String>> mediaUrls;
  final String currency;
  final int basePrice; // paisa
  final int? mrp;
  final int minOrderQty;
  final int stockAvailable;
  final String visibility;
  final String status;
  final int viewCount;
  final int enquiryCount;
  final int orderCount;
  final int reviewCount;
  final double? avgRating;
  final bool isFeatured;
  final List<String> keywords;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Listing({
    required this.id,
    required this.tenantId,
    required this.authorId,
    required this.listingType,
    this.categoryId,
    required this.title,
    this.description,
    this.shortDescription,
    required this.mediaUrls,
    required this.currency,
    required this.basePrice,
    this.mrp,
    required this.minOrderQty,
    required this.stockAvailable,
    required this.visibility,
    required this.status,
    required this.viewCount,
    required this.enquiryCount,
    required this.orderCount,
    required this.reviewCount,
    this.avgRating,
    required this.isFeatured,
    required this.keywords,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Listing.fromJson(Map<String, dynamic> json) => Listing(
    id: json['id'] as String,
    tenantId: json['tenantId'] as String,
    authorId: json['authorId'] as String,
    listingType: json['listingType'] as String,
    categoryId: json['categoryId'] as String?,
    title: json['title'] as String,
    description: json['description'] as String?,
    shortDescription: json['shortDescription'] as String?,
    mediaUrls: (json['mediaUrls'] as List<dynamic>?)
        ?.map((e) => Map<String, String>.from(e as Map))
        .toList() ?? [],
    currency: json['currency'] as String? ?? 'INR',
    basePrice: json['basePrice'] as int? ?? 0,
    mrp: json['mrp'] as int?,
    minOrderQty: json['minOrderQty'] as int? ?? 1,
    stockAvailable: json['stockAvailable'] as int? ?? 0,
    visibility: json['visibility'] as String? ?? 'PUBLIC',
    status: json['status'] as String? ?? 'DRAFT',
    viewCount: json['viewCount'] as int? ?? 0,
    enquiryCount: json['enquiryCount'] as int? ?? 0,
    orderCount: json['orderCount'] as int? ?? 0,
    reviewCount: json['reviewCount'] as int? ?? 0,
    avgRating: (json['avgRating'] as num?)?.toDouble(),
    isFeatured: json['isFeatured'] as bool? ?? false,
    keywords: List<String>.from(json['keywords'] as List? ?? []),
    isActive: json['isActive'] as bool? ?? true,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );

  String get displayPrice {
    final rupees = basePrice / 100;
    if (rupees >= 10000000) return '₹${(rupees / 10000000).toStringAsFixed(2)}Cr';
    if (rupees >= 100000) return '₹${(rupees / 100000).toStringAsFixed(2)}L';
    if (rupees >= 1000) return '₹${(rupees / 1000).toStringAsFixed(1)}K';
    return '₹${rupees.toStringAsFixed(0)}';
  }
}
