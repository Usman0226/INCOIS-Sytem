import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'login_page.dart';
import 'signup_page.dart';
import 'report_alert_page.dart';
import 'hazard_report_page.dart';
import 'report_success_page.dart';
import 'view_report_page.dart';

/// Routing configuration for the app
final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: <RouteBase>[
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/signup', builder: (context, state) => const SignUpPage()),
    GoRoute(path: '/dashboard', builder: (context, state) => const ReportAlertPage()),
    GoRoute(path: '/hazardReport', builder: (context, state) => const HazardReportPage()),
    GoRoute(path: '/success', builder: (context, state) => const ReportSuccessPage()),
    GoRoute(path: '/viewReport', builder: (context, state) => const ViewReportPage()),
  ],
);

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Hazard Reporting App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.lightBlue[50],
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.lightBlueAccent,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56), // Larger buttons
            textStyle: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.lightBlue,
          foregroundColor: Colors.white,
          elevation: 2,
        ),
      ),
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
    );
  }
}

/// Button for use in pages, now with flexible callback.
class SubmitReportButton extends StatelessWidget {
  final VoidCallback? onPressed;
  const SubmitReportButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.lightBlueAccent,
          padding: const EdgeInsets.symmetric(vertical: 22),
          textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        onPressed: onPressed,
        child: const Text("SUBMIT REPORT"),
      ),
    );
  }
}
