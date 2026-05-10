import 'dart:isolate';
import '../domain/engine/rule_parser.dart';
import '../domain/engine/trie_engine.dart';
import '../domain/models/rule.dart';

class IsolateProcessor {
  static Future<String> processTextInIsolate(String text, List<Rule> rules, bool caseSensitive) async {
    final receivePort = ReceivePort();
    
    await Isolate.spawn(_isolateEntry, {
      'sendPort': receivePort.sendPort,
      'text': text,
      'rules': rules.map((r) => {'original': r.original, 'replacement': r.replacement}).toList(),
      'caseSensitive': caseSensitive,
    });
    
    return await receivePort.first as String;
  }

  static void _isolateEntry(Map<String, dynamic> message) {
    final SendPort sendPort = message['sendPort'];
    final String text = message['text'];
    final List<Map<String, String>> rawRules = List<Map<String, String>>.from(message['rules']);
    final bool caseSensitive = message['caseSensitive'];
    
    // Convert back to Rule objects for expansion
    final rules = rawRules.map((r) => Rule(id: '', original: r['original']!, replacement: r['replacement']!)).toList();
    final expandedRules = RuleParser.expandRules(rules);
    
    // Convert to map for TrieEngine
    final engineRules = expandedRules.map((r) => {'original': r.original, 'replacement': r.replacement}).toList();
    
    final engine = TrieEngine(engineRules, caseSensitive: caseSensitive);
    final result = engine.process(text);
    
    sendPort.send(result);
  }
}
