import 'package:flutter/material.dart';
import '../../core/config/theme/colors.dart';
import '../../shared/widgets/empty_state.dart';

class OfferDetailScreen extends StatefulWidget {
  final String offerId;
  const OfferDetailScreen({super.key, required this.offerId});

  @override
  State<OfferDetailScreen> createState() => _OfferDetailScreenState();
}

class _OfferDetailScreenState extends State<OfferDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Offer Details'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined)),
        ],
      ),
      body: const Center(
        child: EmptyState(
          icon: Icons.local_offer_outlined,
          title: 'Loading offer...',
          subtitle: 'Wire to backend to show offer details',
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Check Eligibility & Redeem', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ),
        ),
      ),
    );
  }
}
