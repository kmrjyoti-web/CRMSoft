import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/theme/colors.dart';

class PostCreateScreen extends StatefulWidget {
  const PostCreateScreen({super.key});

  @override
  State<PostCreateScreen> createState() => _PostCreateScreenState();
}

class _PostCreateScreenState extends State<PostCreateScreen> {
  final _contentCtrl = TextEditingController();
  String _postType = 'TEXT';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Post'),
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close),
        ),
        actions: [
          FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 20),
            ),
            child: const Text('Publish'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Post type chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['TEXT', 'IMAGE', 'VIDEO', 'PRODUCT_SHARE', 'CUSTOMER_FEEDBACK', 'PRODUCT_LAUNCH'].map((type) {
                  final selected = _postType == type;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(type.replaceAll('_', ' ')),
                      selected: selected,
                      onSelected: (_) => setState(() => _postType = type),
                      selectedColor: AppColors.primaryLight,
                      checkmarkColor: AppColors.primary,
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: TextField(
                controller: _contentCtrl,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: const InputDecoration(
                  hintText: "What's on your mind? Share a product update, customer feedback, or announcement...",
                  border: InputBorder.none,
                ),
              ),
            ),
            // Media attach bar
            Row(
              children: [
                IconButton(onPressed: () {}, icon: const Icon(Icons.image_outlined, color: AppColors.gray500)),
                IconButton(onPressed: () {}, icon: const Icon(Icons.videocam_outlined, color: AppColors.gray500)),
                IconButton(onPressed: () {}, icon: const Icon(Icons.tag, color: AppColors.gray500)),
                IconButton(onPressed: () {}, icon: const Icon(Icons.location_on_outlined, color: AppColors.gray500)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    super.dispose();
  }
}
