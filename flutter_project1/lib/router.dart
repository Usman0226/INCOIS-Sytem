import 'package:flutter/material.dart';
import 'login_page.dart';
import 'signup_page.dart';
import 'report_alert_page.dart';
import 'hazard_report_page.dart';
import 'report_success_page.dart';
import 'view_report_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hazard Reporting App',
      theme: ThemeData(primarySwatch: Colors.blue),
      debugShowCheckedModeBanner: false,

      // No router.dart required, just define routes here
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginPage(),
        '/signup': (context) => SignUpPage(),
        '/dashboard': (context) => ReportAlertPage(),
        '/hazardReport': (context) => HazardReportPage(),
        '/success': (context) => ReportSuccessPage(),
        '/viewReport': (context) => ViewReportPage(),
      },
    );
  }
}
