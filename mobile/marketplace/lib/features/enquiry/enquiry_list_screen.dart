import 'package:flutter/material.dart';
import '../../shared/widgets/empty_state.dart';

class EnquiryListScreen extends StatelessWidget {
  const EnquiryListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enquiries')),
      body: const EmptyState(
        icon: Icons.message_outlined,
        title: 'No enquiries yet',
        subtitle: 'Customer enquiries for your products will appear here',
      ),
    );
  }
}
