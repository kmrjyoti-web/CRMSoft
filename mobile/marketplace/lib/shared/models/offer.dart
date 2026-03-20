class MarketplaceOffer {
  final String id;
  final String tenantId;
  final String title;
  final String? description;
  final String offerType;
  final String discountType;
  final double discountValue;
  final List<String> linkedListingIds;
  final Map<String, dynamic> conditions;
  final int? maxRedemptions;
  final int currentRedemptions;
  final String status;
  final DateTime? publishAt;
  final DateTime? expiresAt;
  final int impressionCount;
  final int clickCount;
  final int orderCount;
  final DateTime createdAt;

  const MarketplaceOffer({
    required this.id,
    required this.tenantId,
    required this.title,
    this.description,
    required this.offerType,
    required this.discountType,
    required this.discountValue,
    required this.linkedListingIds,
    required this.conditions,
    this.maxRedemptions,
    required this.currentRedemptions,
    required this.status,
    this.publishAt,
    this.expiresAt,
    required this.impressionCount,
    required this.clickCount,
    required this.orderCount,
    required this.createdAt,
  });

  factory MarketplaceOffer.fromJson(Map<String, dynamic> json) => MarketplaceOffer(
    id: json['id'] as String,
    tenantId: json['tenantId'] as String,
    title: json['title'] as String,
    description: json['description'] as String?,
    offerType: json['offerType'] as String,
    discountType: json['discountType'] as String,
    discountValue: (json['discountValue'] as num).toDouble(),
    linkedListingIds: List<String>.from(json['linkedListingIds'] as List? ?? []),
    conditions: json['conditions'] as Map<String, dynamic>? ?? {},
    maxRedemptions: json['maxRedemptions'] as int?,
    currentRedemptions: json['currentRedemptions'] as int? ?? 0,
    status: json['status'] as String? ?? 'DRAFT',
    publishAt: json['publishAt'] != null ? DateTime.parse(json['publishAt'] as String) : null,
    expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt'] as String) : null,
    impressionCount: json['impressionCount'] as int? ?? 0,
    clickCount: json['clickCount'] as int? ?? 0,
    orderCount: json['orderCount'] as int? ?? 0,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  String get discountLabel {
    if (discountType == 'PERCENTAGE') return '${discountValue.toStringAsFixed(0)}% OFF';
    if (discountType == 'FLAT_AMOUNT') {
      final rupees = discountValue / 100;
      return '₹${rupees.toStringAsFixed(0)} OFF';
    }
    if (discountType == 'FREE_SHIPPING') return 'Free Shipping';
    return discountType.replaceAll('_', ' ');
  }

  bool get hasExpiry => expiresAt != null;

  Duration? get timeRemaining {
    if (expiresAt == null) return null;
    final remaining = expiresAt!.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }
}
