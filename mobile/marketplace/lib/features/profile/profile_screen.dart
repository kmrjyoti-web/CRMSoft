import 'package:flutter/material.dart';
import '../../shared/widgets/empty_state.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.edit_outlined)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.settings_outlined)),
        ],
      ),
      body: const EmptyState(
        icon: Icons.person_outline,
        title: 'Your profile',
        subtitle: 'Company info, posts, reviews and stats will appear here',
      ),
    );
  }
}
