import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// (Replace with your backend API logic)
Future<bool> sendOtp(String mobile) async {
  await Future.delayed(const Duration(seconds: 1));
  return true;
}

Future<bool> verifyOtp(String mobile, String otp) async {
  await Future.delayed(const Duration(seconds: 1));
  return otp == "1234";
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _mobileController = TextEditingController();
  final _otpController = TextEditingController();
  bool _isOtpSent = false;
  String _errorMsg = "";

  @override
  void dispose() {
    _mobileController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _sendOtp() async {
    FocusScope.of(context).unfocus();
    final mobile = _mobileController.text.trim();
    if (mobile.isEmpty || mobile.length != 10 || !RegExp(r'^[0-9]+$').hasMatch(mobile)) {
      setState(() => _errorMsg = "Enter a valid 10-digit mobile number");
      return;
    }
    final success = await sendOtp(mobile);
    setState(() {
      if (success) {
        _isOtpSent = true;
        _errorMsg = "OTP sent to $mobile";
      } else {
        _errorMsg = "Failed to send OTP";
      }
    });
  }

  Future<void> _login() async {
    FocusScope.of(context).unfocus();
    final mobile = _mobileController.text.trim();
    final otp = _otpController.text.trim();
    if (otp.isEmpty || otp.length < 4) {
      setState(() => _errorMsg = "Enter a valid OTP");
      return;
    }
    final valid = await verifyOtp(mobile, otp);
    if (valid) {
      if (!mounted) return;
      context.go('/dashboard');
    } else {
      setState(() => _errorMsg = "Invalid OTP");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Login"),
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
                  controller: _mobileController,
                  decoration: const InputDecoration(labelText: "Mobile Number"),
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  enabled: !_isOtpSent,
                  onSubmitted: (_) {
                    if (!_isOtpSent) _sendOtp();
                  },
                ),
                const SizedBox(height: 10),
                if (_isOtpSent)
                  TextField(
                    controller: _otpController,
                    decoration: const InputDecoration(labelText: "OTP"),
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    onSubmitted: (_) => _login(),
                  ),
                if (_errorMsg.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(_errorMsg,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center),
                  ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isOtpSent ? _login : _sendOtp,
                  child: Text(_isOtpSent ? "Login" : "Send OTP"),
                ),
                const SizedBox(height: 24),
                TextButton(
                  child: const Text("New User? Sign Up"),
                  onPressed: () => context.push('/signup'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
