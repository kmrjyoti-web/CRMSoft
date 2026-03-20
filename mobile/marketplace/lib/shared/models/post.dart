class MarketplacePost {
  final String id;
  final String tenantId;
  final String authorId;
  final String postType;
  final String? content;
  final List<Map<String, String>> mediaUrls;
  final String? linkedListingId;
  final String? linkedOfferId;
  final int? rating;
  final String visibility;
  final String status;
  final DateTime? publishAt;
  final int viewCount;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final int saveCount;
  final List<String> hashtags;
  final DateTime createdAt;

  const MarketplacePost({
    required this.id,
    required this.tenantId,
    required this.authorId,
    required this.postType,
    this.content,
    required this.mediaUrls,
    this.linkedListingId,
    this.linkedOfferId,
    this.rating,
    required this.visibility,
    required this.status,
    this.publishAt,
    required this.viewCount,
    required this.likeCount,
    required this.commentCount,
    required this.shareCount,
    required this.saveCount,
    required this.hashtags,
    required this.createdAt,
  });

  factory MarketplacePost.fromJson(Map<String, dynamic> json) => MarketplacePost(
    id: json['id'] as String,
    tenantId: json['tenantId'] as String,
    authorId: json['authorId'] as String,
    postType: json['postType'] as String,
    content: json['content'] as String?,
    mediaUrls: (json['mediaUrls'] as List<dynamic>?)
        ?.map((e) => Map<String, String>.from(e as Map))
        .toList() ?? [],
    linkedListingId: json['linkedListingId'] as String?,
    linkedOfferId: json['linkedOfferId'] as String?,
    rating: json['rating'] as int?,
    visibility: json['visibility'] as String? ?? 'PUBLIC',
    status: json['status'] as String? ?? 'DRAFT',
    publishAt: json['publishAt'] != null ? DateTime.parse(json['publishAt'] as String) : null,
    viewCount: json['viewCount'] as int? ?? 0,
    likeCount: json['likeCount'] as int? ?? 0,
    commentCount: json['commentCount'] as int? ?? 0,
    shareCount: json['shareCount'] as int? ?? 0,
    saveCount: json['saveCount'] as int? ?? 0,
    hashtags: List<String>.from(json['hashtags'] as List? ?? []),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
}
