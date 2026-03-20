import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme/colors.dart';

class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.gray200,
      highlightColor: Colors.white,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.gray200,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class FeedCardSkeleton extends StatelessWidget {
  const FeedCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ShimmerBox(width: 40, height: 40, borderRadius: BorderRadius.circular(20)),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ShimmerBox(width: 120, height: 12),
                    const SizedBox(height: 6),
                    ShimmerBox(width: 80, height: 10),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            ShimmerBox(width: double.infinity, height: 200, borderRadius: BorderRadius.circular(12)),
            const SizedBox(height: 12),
            ShimmerBox(width: double.infinity, height: 12),
            const SizedBox(height: 6),
            ShimmerBox(width: 200, height: 12),
          ],
        ),
      ),
    );
  }
}
