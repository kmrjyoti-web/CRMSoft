import 'package:flutter/material.dart';
import '../../core/config/theme/colors.dart';

class EngagementBar extends StatelessWidget {
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final int saveCount;
  final bool isLiked;
  final bool isSaved;
  final VoidCallback? onLike;
  final VoidCallback? onComment;
  final VoidCallback? onShare;
  final VoidCallback? onSave;

  const EngagementBar({
    super.key,
    required this.likeCount,
    required this.commentCount,
    required this.shareCount,
    required this.saveCount,
    this.isLiked = false,
    this.isSaved = false,
    this.onLike,
    this.onComment,
    this.onShare,
    this.onSave,
  });

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _ActionButton(
          icon: isLiked ? Icons.favorite : Icons.favorite_border,
          color: isLiked ? AppColors.danger : AppColors.gray500,
          count: _formatCount(likeCount),
          onTap: onLike,
        ),
        const SizedBox(width: 16),
        _ActionButton(
          icon: Icons.chat_bubble_outline,
          color: AppColors.gray500,
          count: _formatCount(commentCount),
          onTap: onComment,
        ),
        const SizedBox(width: 16),
        _ActionButton(
          icon: Icons.share_outlined,
          color: AppColors.gray500,
          count: _formatCount(shareCount),
          onTap: onShare,
        ),
        const Spacer(),
        _ActionButton(
          icon: isSaved ? Icons.bookmark : Icons.bookmark_border,
          color: isSaved ? AppColors.primary : AppColors.gray500,
          count: _formatCount(saveCount),
          onTap: onSave,
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String count;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.count,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 4),
          Text(count, style: TextStyle(fontSize: 13, color: color, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
