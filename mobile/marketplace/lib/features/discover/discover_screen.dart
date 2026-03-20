import 'package:flutter/material.dart';
import '../../core/config/theme/colors.dart';
import '../../shared/widgets/empty_state.dart';

class DiscoverScreen extends StatelessWidget {
  const DiscoverScreen({super.key});

  static const _categories = [
    {'icon': Icons.inventory_2_outlined, 'label': 'Products', 'color': 0xFF6366F1},
    {'icon': Icons.build_outlined, 'label': 'Services', 'color': 0xFF3B82F6},
    {'icon': Icons.assignment_outlined, 'label': 'Requirements', 'color': 0xFFF59E0B},
    {'icon': Icons.work_outline, 'label': 'Jobs', 'color': 0xFF10B981},
    {'icon': Icons.local_offer_outlined, 'label': 'Offers', 'color': 0xFFEC4899},
    {'icon': Icons.star_outline, 'label': 'Reviews', 'color': 0xFFF97316},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: SearchBar(
              hintText: 'Search products, services, companies...',
              leading: const Icon(Icons.search, size: 20),
              elevation: const WidgetStatePropertyAll(0),
            ),
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text('Browse Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.gray900)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1,
              ),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final color = Color(cat['color'] as int);
                return GestureDetector(
                  onTap: () {},
                  child: Container(
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: color.withOpacity(0.2)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(cat['icon'] as IconData, size: 28, color: color),
                        const SizedBox(height: 8),
                        Text(cat['label'] as String, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Text('Trending Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.gray900)),
          ),
          const Expanded(
            child: EmptyState(
              icon: Icons.trending_up,
              title: 'Loading trending content',
              subtitle: 'Connect to backend to see trending posts and listings',
            ),
          ),
        ],
      ),
    );
  }
}
