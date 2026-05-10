class TrieNode {
  final Map<String, TrieNode> children = {};
  String? replacement;
}

class TrieEngine {
  final TrieNode root = TrieNode();
  final bool caseSensitive;

  TrieEngine(List<Map<String, String>> rules, {this.caseSensitive = false}) {
    for (var rule in rules) {
      _insert(rule['original']!, rule['replacement']!);
    }
  }

  void _insert(String original, String replacement) {
    TrieNode node = root;
    final word = caseSensitive ? original : original.toLowerCase();
    for (int i = 0; i < word.length; i++) {
      final char = word[i];
      node.children.putIfAbsent(char, () => TrieNode());
      node = node.children[char]!;
    }
    node.replacement ??= replacement;
  }

  String process(String text) {
    final buffer = StringBuffer();
    int i = 0;
    
    while (i < text.length) {
      TrieNode node = root;
      int longestMatchLength = 0;
      String? longestReplacement;
      
      int j = i;
      while (j < text.length) {
        final char = caseSensitive ? text[j] : text[j].toLowerCase();
        if (node.children.containsKey(char)) {
          node = node.children[char]!;
          if (node.replacement != null) {
            longestMatchLength = j - i + 1;
            longestReplacement = node.replacement;
          }
          j++;
        } else {
          break;
        }
      }
      
      if (longestMatchLength > 0) {
        buffer.write(longestReplacement);
        i += longestMatchLength;
      } else {
        buffer.write(text[i]);
        i++;
      }
    }
    return buffer.toString();
  }
}
