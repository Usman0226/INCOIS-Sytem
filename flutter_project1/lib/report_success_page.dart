import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'hazard_report_model.dart';

class ReportSuccessPage extends StatelessWidget {
  const ReportSuccessPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Get the report object (may be null if navigated without extra)
    final report = GoRouterState.of(context).extra as HazardReport?;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Report Submitted"),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Image.asset(
              'assets/bZLl7vOopy4JrRaPcpkKDMxNPW_bQk5ALNocVql8tv5lMhq8NZsqYJkEu3pa4LIM-CVePCkPh3JgRXlmWMq2NtqAX3pRqnRn0-dzdx[1].jpg',
              width: 36,
              errorBuilder: (context, error, stackTrace) =>
                  const Icon(Icons.error, color: Colors.white),
            ),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 80),
            const SizedBox(height: 20),
            const Text(
              "Report submitted successfully!",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 50),
              ),
              onPressed: report != null
                  ? () => context.push('/viewReport', extra: report)
                  : null,
              child: const Text("View Report"),
            ),
          ],
        ),
      ),
    );
  }
}
