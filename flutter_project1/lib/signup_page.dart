// lib/signup_page.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _usernameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _otpController = TextEditingController();
  final ApiService _apiService = ApiService(); // Use the real API service

  bool _otpSent = false;
  bool _isLoading = false; // Added for loading state
  String _errorMsg = "";

  @override
  void dispose() {
    _usernameController.dispose();
    _mobileController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _sendOtp() async {
    FocusScope.of(context).unfocus();
    final username = _usernameController.text.trim();
    final mobile = _mobileController.text.trim();

    if (username.isEmpty) {
      setState(() => _errorMsg = "Username required");
      return;
    }
    if (mobile.isEmpty ||
        mobile.length != 10 ||
        !RegExp(r'^[0-9]+$').hasMatch(mobile)) {
      setState(() => _errorMsg = "Enter a valid 10-digit mobile number");
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = "";
    });

    // Use the real ApiService to register
    final result =
        await _apiService.registerUser(name: username, phone: mobile);

    setState(() {
      _isLoading = false;
      if (result['success']) {
        _otpSent = true;
        _errorMsg = result['message'] ?? "OTP sent to $mobile";
      } else {
        _errorMsg = result['message'] ?? "Failed to send OTP";
      }
    });
  }

  Future<void> _signUp() async {
    FocusScope.of(context).unfocus();
    final mobile = _mobileController.text.trim();
    final otp = _otpController.text.trim();

    if (otp.isEmpty || otp.length < 4) {
      setState(() => _errorMsg = "Enter a valid OTP");
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = "";
    });

    // Use the real ApiService to verify
    final result = await _apiService.verifyOtp(phone: mobile, otp: otp);

    setState(() => _isLoading = false);

    if (result['success']) {
      // Store the token and user info
      AuthService.setCredentials(
        result['token'],
        result['user'] as Map<String, dynamic>?,
      );
      if (!mounted) return;
      context.go('/dashboard');
    } else {
      setState(() => _errorMsg = result['message'] ?? "Invalid OTP or username");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Sign Up"),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Image.asset('assets/logo_(1)[1].png', width: 36),
          ),
        ],
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 48),
                TextField(
                  controller: _usernameController,
                  decoration: const InputDecoration(labelText: "Username"),
                  enabled: !_otpSent && !_isLoading,
                  onSubmitted: (_) {
                    if (!_otpSent) _sendOtp();
                  },
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _mobileController,
                  decoration: const InputDecoration(labelText: "Mobile Number"),
                  enabled: !_otpSent && !_isLoading,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  onSubmitted: (_) {
                    if (!_otpSent) _sendOtp();
                  },
                ),
                const SizedBox(height: 20),
                if (_otpSent)
                  TextField(
                    controller: _otpController,
                    decoration: const InputDecoration(labelText: "OTP"),
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    enabled: !_isLoading,
                    onSubmitted: (_) => _signUp(),
                  ),
                if (_errorMsg.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(_errorMsg,
                        style: TextStyle(
                            color: _errorMsg.contains("sent")
                                ? Colors.green
                                : Colors.red),
                        textAlign: TextAlign.center),
                  ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : (_otpSent ? _signUp : _sendOtp),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(_otpSent ? "Sign Up & Verify" : "Send OTP"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}