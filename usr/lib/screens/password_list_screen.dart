import 'package:flutter/material.dart';
import '../models/password_entry.dart';
import 'password_edit_screen.dart';

class PasswordListScreen extends StatefulWidget {
  const PasswordListScreen({super.key});

  @override
  _PasswordListScreenState createState() => _PasswordListScreenState();
}

class _PasswordListScreenState extends State<PasswordListScreen> {
  final List<PasswordEntry> _passwordEntries = [];

  void _addPassword() async {
    final newEntry = await Navigator.of(context).push<PasswordEntry>(
      MaterialPageRoute(
        builder: (context) => const PasswordEditScreen(),
      ),
    );

    if (newEntry != null) {
      setState(() {
        _passwordEntries.add(newEntry);
      });
    }
  }

  void _editPassword(int index) async {
    final updatedEntry = await Navigator.of(context).push<PasswordEntry>(
      MaterialPageRoute(
        builder: (context) => PasswordEditScreen(
          passwordEntry: _passwordEntries[index],
        ),
      ),
    );

    if (updatedEntry != null) {
      setState(() {
        _passwordEntries[index] = updatedEntry;
      });
    }
  }

  void _deletePassword(int index) {
    setState(() {
      _passwordEntries.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Password Manager'),
      ),
      body: _passwordEntries.isEmpty
          ? const Center(
              child: Text('No passwords saved yet.'),
            )
          : ListView.builder(
              itemCount: _passwordEntries.length,
              itemBuilder: (context, index) {
                final entry = _passwordEntries[index];
                return ListTile(
                  title: Text(entry.service),
                  subtitle: Text(entry.username),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit),
                        onPressed: () => _editPassword(index),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete),
                        onPressed: () => _deletePassword(index),
                      ),
                    ],
                  ),
                  onTap: () => _editPassword(index),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addPassword,
        child: const Icon(Icons.add),
      ),
    );
  }
}
