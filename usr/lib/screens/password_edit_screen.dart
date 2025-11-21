import 'package:flutter/material.dart';
import '../models/password_entry.dart';

class PasswordEditScreen extends StatefulWidget {
  final PasswordEntry? passwordEntry;

  const PasswordEditScreen({super.key, this.passwordEntry});

  @override
  _PasswordEditScreenState createState() => _PasswordEditScreenState();
}

class _PasswordEditScreenState extends State<PasswordEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _serviceController;
  late TextEditingController _usernameController;
  late TextEditingController _passwordController;
  bool _obscureText = true;

  @override
  void initState() {
    super.initState();
    _serviceController =
        TextEditingController(text: widget.passwordEntry?.service ?? '');
    _usernameController =
        TextEditingController(text: widget.passwordEntry?.username ?? '');
    _passwordController =
        TextEditingController(text: widget.passwordEntry?.password ?? '');
  }

  @override
  void dispose() {
    _serviceController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _saveForm() {
    if (_formKey.currentState!.validate()) {
      final newEntry = PasswordEntry(
        service: _serviceController.text,
        username: _usernameController.text,
        password: _passwordController.text,
      );
      Navigator.of(context).pop(newEntry);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.passwordEntry == null ? 'Add Password' : 'Edit Password'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveForm,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _serviceController,
                decoration: const InputDecoration(labelText: 'Service/Website'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a service or website name';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(labelText: 'Username/Email'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a username or email';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscureText,
                decoration: InputDecoration(
                  labelText: 'Password',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureText ? Icons.visibility : Icons.visibility_off,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscureText = !_obscureText;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a password';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
