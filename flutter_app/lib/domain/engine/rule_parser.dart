import '../models/rule.dart';

class RuleParser {
  static List<Rule> parseTextbox(String text) {
    final rawRules = text.split(RegExp(r'[\n，,]')).map((s) => s.trim()).where((s) => s.isNotEmpty);
    final rules = <Rule>[];
    
    for (var raw in rawRules) {
      String orig = '';
      String rep = '';
      
      if (raw.contains('=')) {
        final parts = raw.split('=');
        orig = parts[0].trim();
        rep = parts.sublist(1).join('=').trim();
      } else if (raw.contains(':')) {
        final parts = raw.split(':');
        orig = parts[0].trim();
        rep = parts.sublist(1).join(':').trim();
      } else if (raw.contains('：')) {
        final parts = raw.split('：');
        orig = parts[0].trim();
        rep = parts.sublist(1).join('：').trim();
      } else {
        continue;
      }
      
      if (orig.startsWith('"') && orig.endsWith('"')) {
        orig = orig.substring(1, orig.length - 1);
      }
      
      rules.add(Rule(id: DateTime.now().microsecondsSinceEpoch.toString(), original: orig, replacement: rep));
    }
    
    return rules;
  }

  static List<Rule> expandRules(List<Rule> rules) {
    final expanded = <Rule>[];
    
    for (var rule in rules) {
      final orig = rule.original;
      final rep = rule.replacement;
      
      final origParts = orig.split(RegExp(r'[\s·]+'));
      String repSeparator = '';
      List<String> repParts = [];
      
      if (rep.contains('·')) {
        repSeparator = '·';
        repParts = rep.split('·');
      } else if (rep.contains(' ')) {
        repSeparator = ''; // Join without space
        repParts = rep.split(' ');
      } else {
        repSeparator = '';
        repParts = [rep];
      }
      
      if (origParts.length > 1 && origParts.length == repParts.length) {
        expanded.add(Rule(id: '', original: origParts.join(' '), replacement: repParts.join(repSeparator)));
        expanded.add(Rule(id: '', original: origParts.reversed.join(' '), replacement: repParts.join(repSeparator)));
        
        for (int i = 0; i < origParts.length; i++) {
          expanded.add(Rule(id: '', original: origParts[i], replacement: repParts[i]));
        }
      } else {
        expanded.add(Rule(id: '', original: orig, replacement: rep));
      }
    }
    
    // Deduplicate and sort by length descending
    final unique = <String, String>{};
    for (var r in expanded) {
      unique.putIfAbsent(r.original, () => r.replacement);
    }
    
    final finalRules = unique.entries.map((e) => Rule(id: '', original: e.key, replacement: e.value)).toList();
    finalRules.sort((a, b) => b.original.length.compareTo(a.original.length));
    
    return finalRules;
  }
}
