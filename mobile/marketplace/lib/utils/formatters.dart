class Formatters {
  static String inr(int paisa) {
    final rupees = paisa / 100;
    if (rupees >= 10000000) return '₹${(rupees / 10000000).toStringAsFixed(2)} Cr';
    if (rupees >= 100000) return '₹${(rupees / 100000).toStringAsFixed(2)} L';
    if (rupees >= 1000) return '₹${(rupees / 1000).toStringAsFixed(1)} K';
    return '₹${rupees.toStringAsFixed(0)}';
  }

  static String countdown(Duration d) {
    if (d <= Duration.zero) return 'Expired';
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    final s = d.inSeconds.remainder(60);
    if (h > 0) return '${h}h ${m}m';
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  static String shortDate(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  static String relativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return shortDate(dt);
  }
}
