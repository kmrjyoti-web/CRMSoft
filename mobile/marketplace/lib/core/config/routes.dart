import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/feed/feed_screen.dart';
import '../../features/discover/discover_screen.dart';
import '../../features/offers/offers_screen.dart';
import '../../features/offers/offer_detail_screen.dart';
import '../../features/product_detail/product_detail_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/post_create/post_create_screen.dart';
import '../../features/enquiry/enquiry_list_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../auth/auth_screen.dart';
import '../shell/main_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/feed',
    routes: [
      // Auth
      GoRoute(
        path: '/login',
        builder: (context, state) => const AuthScreen(),
      ),
      // Main shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/feed',
            builder: (context, state) => const FeedScreen(),
          ),
          GoRoute(
            path: '/discover',
            builder: (context, state) => const DiscoverScreen(),
          ),
          GoRoute(
            path: '/offers',
            builder: (context, state) => const OffersScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      // Detail screens (full-screen, no bottom nav)
      GoRoute(
        path: '/listing/:id',
        builder: (context, state) => ProductDetailScreen(
          listingId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/offer/:id',
        builder: (context, state) => OfferDetailScreen(
          offerId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/create',
        builder: (context, state) => const PostCreateScreen(),
      ),
      GoRoute(
        path: '/enquiries',
        builder: (context, state) => const EnquiryListScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
    ],
  );
});
