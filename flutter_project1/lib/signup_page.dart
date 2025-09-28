import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Replace these with actual backend REST calls in production.
Future<bool> sendOtp(String mobile) async {
  await Future.delayed(const Duration(seconds: 1));
  return true;
}

Future<bool> verifyAndRegister(String username, String mobile, String otp) async {
  await Future.delayed(const Duration(seconds: 1));
  return otp == "1234" && username.isNotEmpty;
}

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _usernameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _otpController = TextEditingController();

  bool _otpSent = false;
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
    if (mobile.isEmpty || mobile.length != 10 || !RegExp(r'^[0-9]+$').hasMatch(mobile)) {
      setState(() => _errorMsg = "Enter a valid 10-digit mobile number");
      return;
    }
    final success = await sendOtp(mobile);
    setState(() {
      if (success) {
        _otpSent = true;
        _errorMsg = "OTP sent to $mobile";
      } else {
        _errorMsg = "Failed to send OTP";
      }
    });
  }

  Future<void> _signUp() async {
    FocusScope.of(context).unfocus();
    final username = _usernameController.text.trim();
    final mobile = _mobileController.text.trim();
    final otp = _otpController.text.trim();

    if (otp.isEmpty || otp.length < 4) {
      setState(() => _errorMsg = "Enter a valid OTP");
      return;
    }
    final valid = await verifyAndRegister(username, mobile, otp);
    if (valid) {
      if (!mounted) return;
      context.go('/dashboard');
    } else {
      setState(() => _errorMsg = "Invalid OTP or username");
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
                  enabled: !_otpSent,
                  onSubmitted: (_) {
                    if (!_otpSent) _sendOtp();
                  },
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _mobileController,
                  decoration: const InputDecoration(labelText: "Mobile Number"),
                  enabled: !_otpSent,
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
                    onSubmitted: (_) => _signUp(),
                  ),
                if (_errorMsg.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(_errorMsg,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center),
                  ),
                const SizedBox(height: 32),
                ElevatedButton(
                  child: Text(_otpSent ? "Sign Up" : "Send OTP"),
                  onPressed: _otpSent ? _signUp : _sendOtp,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
