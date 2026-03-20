import 'package:flutter/material.dart';
import '../../core/config/theme/colors.dart';

class PriceDisplay extends StatelessWidget {
  final int priceInPaisa;
  final int? mrpInPaisa;
  final double fontSize;
  final bool compact;

  const PriceDisplay({
    super.key,
    required this.priceInPaisa,
    this.mrpInPaisa,
    this.fontSize = 16,
    this.compact = false,
  });

  String _format(int paisa) {
    final rupees = paisa / 100;
    if (rupees >= 10000000) return '₹${(rupees / 10000000).toStringAsFixed(2)}Cr';
    if (rupees >= 100000) return '₹${(rupees / 100000).toStringAsFixed(2)}L';
    if (compact && rupees >= 1000) return '₹${(rupees / 1000).toStringAsFixed(1)}K';
    return '₹${rupees.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          _format(priceInPaisa),
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w800,
            color: AppColors.gray900,
          ),
        ),
        if (mrpInPaisa != null && mrpInPaisa! > priceInPaisa) ...[
          const SizedBox(width: 6),
          Text(
            _format(mrpInPaisa!),
            style: TextStyle(
              fontSize: fontSize * 0.8,
              decoration: TextDecoration.lineThrough,
              color: AppColors.gray400,
            ),
          ),
        ],
      ],
    );
  }
}
