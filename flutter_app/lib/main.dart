import 'package:flutter/material.dart';

void main() {
  runApp(const FindReplaceApp());
}

class FindReplaceApp extends StatelessWidget {
  const FindReplaceApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Advanced Find & Replace',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Advanced Find & Replace'),
        actions: [
          IconButton(icon: const Icon(Icons.upload_file), onPressed: () {}),
          IconButton(icon: const Icon(Icons.play_arrow), onPressed: () {}),
          IconButton(icon: const Icon(Icons.download), onPressed: () {}),
        ],
      ),
      body: Row(
        children: [
          // Left Panel: Rules
          Expanded(
            flex: 1,
            child: Container(
              color: Theme.of(context).colorScheme.surfaceVariant,
              child: const Center(child: Text('Rule Editor Widget')),
            ),
          ),
          const VerticalDivider(width: 1),
          // Right Panel: Preview
          Expanded(
            flex: 2,
            child: Container(
              color: Theme.of(context).colorScheme.surface,
              child: const Center(child: Text('Preview Pane Widget')),
            ),
          ),
        ],
      ),
    );
  }
}
