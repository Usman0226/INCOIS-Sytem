// lib/report_alert_page.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'services/auth_service.dart'; // Import the AuthService

class ReportAlertPage extends StatelessWidget {
  const ReportAlertPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Get the user's name from the AuthService
    final String userName = AuthService.userName ?? "User";

    return Scaffold(
      appBar: AppBar(
        title: const Text("Dashboard"),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Builder(
              builder: (context) {
                return Image.asset(
                  'assets/bZLl7vOopy4JrRaPcpkKDMxNPW_bQk5ALNocVql8tv5lMhq8NZsqYJkEu3pa4LIM-CVePCkPh3JgRXlmWMq2NtqAX3pRqnRn0-dzdx[1].jpg',
                  width: 36,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.error, color: Colors.white),
                );
              },
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              "Welcome, $userName!", // Display the dynamic user name
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue),
              textAlign: TextAlign.left,
            ),
            const SizedBox(height: 24),
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: const [
                    Text("Your Hazard Reports",
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text("0 pending, 0 resolved",
                        style: TextStyle(fontSize: 16)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              icon: const Icon(Icons.warning_amber_rounded),
              label: const Text("Report Hazard"),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 54),
                textStyle: const TextStyle(fontSize: 20),
              ),
              onPressed: () => context.push('/hazardReport'),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              icon: const Icon(Icons.visibility),
              label: const Text("View Hazard Reports"),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 54),
                textStyle: const TextStyle(fontSize: 20),
                backgroundColor: Colors.blueGrey,
              ),
              onPressed: () => context.push('/viewReport'),
            ),
          ],
        ),
      ),
    );
  }
}