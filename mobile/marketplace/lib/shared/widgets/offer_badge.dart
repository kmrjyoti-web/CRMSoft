import 'package:flutter/material.dart';
import '../../core/config/theme/colors.dart';
import '../models/offer.dart';

class OfferBadge extends StatelessWidget {
  final MarketplaceOffer offer;
  final bool compact;

  const OfferBadge({super.key, required this.offer, this.compact = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 12,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(compact ? 6 : 8),
      ),
      child: Text(
        offer.discountLabel,
        style: TextStyle(
          color: Colors.white,
          fontSize: compact ? 11 : 13,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
