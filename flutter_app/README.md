# Advanced File Find & Replace Tool (Flutter)

A cross-platform (Web, Windows, Android) file find-and-replace application using Flutter.

## Architecture

This project follows Clean Architecture principles:
- **domain**: Core business logic (Rule, ReplacementEngine, TrieEngine) independent of any framework.
- **application**: State management (Bloc/Cubit) and use cases.
- **infrastructure**: File handling (dart:io, file_picker) and isolate management.
- **presentation**: Flutter UI widgets and screens (Material 3).

## Core Features
1. **Longest-Match-First Engine**: Uses a Trie-based algorithm to ensure deterministic, longest-match-first replacements without cascading or O(n²) performance issues.
2. **Multi-Part Expansion**: Automatically expands rules like `Wakaba Mutsumi = 若叶 睦` into 4 separate rules.
3. **Isolate Processing**: Heavy text processing is offloaded to background isolates to keep the UI responsive.
4. **Cross-Platform File Handling**: Abstracts file picking and saving across Web, Desktop, and Mobile.

## Getting Started
1. `flutter pub get`
2. `flutter run -d windows` (or `chrome`, `android`)
