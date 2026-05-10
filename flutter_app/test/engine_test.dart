import 'package:flutter_test/flutter_test.dart';
import '../lib/domain/engine/rule_parser.dart';
import '../lib/domain/engine/trie_engine.dart';
import '../lib/domain/models/rule.dart';

void main() {
  group('RuleParser Tests', () {
    test('expands multi-part rules correctly', () {
      final rules = [
        Rule(id: '1', original: 'Wakaba Mutsumi', replacement: '若叶 睦')
      ];
      
      final expanded = RuleParser.expandRules(rules);
      
      expect(expanded.length, 4);
      expect(expanded.any((r) => r.original == 'Wakaba Mutsumi' && r.replacement == '若叶睦'), true);
      expect(expanded.any((r) => r.original == 'Mutsumi Wakaba' && r.replacement == '若叶睦'), true);
      expect(expanded.any((r) => r.original == 'Wakaba' && r.replacement == '若叶'), true);
      expect(expanded.any((r) => r.original == 'Mutsumi' && r.replacement == '睦'), true);
    });
  });

  group('TrieEngine Tests', () {
    test('replaces longest match first deterministically', () {
      final rules = [
        {'original': '父母', 'replacement': '母父'},
        {'original': '父', 'replacement': '母'},
      ];
      
      final engine = TrieEngine(rules);
      final result = engine.process('父母');
      
      expect(result, '母父'); // Not 母母
    });
  });
}
