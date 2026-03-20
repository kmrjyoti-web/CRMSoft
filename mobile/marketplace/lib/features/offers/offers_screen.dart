import 'package:flutter/material.dart';
import '../../shared/widgets/empty_state.dart';

class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Offers'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.filter_list)),
        ],
      ),
      body: const EmptyState(
        icon: Icons.local_offer_outlined,
        title: 'No active offers',
        subtitle: 'Active marketplace offers will appear here',
      ),
    );
  }
}
