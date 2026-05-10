class Rule {
  final String id;
  final String original;
  final String replacement;

  const Rule({
    required this.id,
    required this.original,
    required this.replacement,
  });

  Rule copyWith({
    String? id,
    String? original,
    String? replacement,
  }) {
    return Rule(
      id: id ?? this.id,
      original: original ?? this.original,
      replacement: replacement ?? this.replacement,
    );
  }
}
