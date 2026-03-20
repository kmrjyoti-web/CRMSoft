class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? errorCode;

  const ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.errorCode,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'] as String?,
      errorCode: json['errorCode'] as String?,
    );
  }
}

class PaginatedResponse<T> {
  final List<T> data;
  final int page;
  final int limit;
  final int total;
  final bool hasMore;

  const PaginatedResponse({
    required this.data,
    required this.page,
    required this.limit,
    required this.total,
    required this.hasMore,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    final rawData = json['data'];
    final List<dynamic> items = rawData is List
        ? rawData
        : (rawData is Map && rawData['data'] is List ? rawData['data'] : []);
    final meta = rawData is Map ? rawData['meta'] : json['meta'];

    return PaginatedResponse(
      data: items.map(fromJsonT).toList(),
      page: meta?['page'] as int? ?? 1,
      limit: meta?['limit'] as int? ?? 20,
      total: meta?['total'] as int? ?? 0,
      hasMore: meta?['hasMore'] as bool? ?? false,
    );
  }
}
