import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'hazard_report_model.dart';

class ReportSuccessPage extends StatelessWidget {
  const ReportSuccessPage({super.key});

  @override
  Widget build(BuildContext context) {
    // The report object is passed via GoRouter's `extra` parameter
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
            ),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 80),
            SizedBox(height: 20),
            Text(
              "Report submitted successfully!",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 50), // Override the infinite width
              ),
              onPressed: () {
                if (report != null) {
                  context.push('/viewReport', extra: report);
                }
              },
              child: Text("View Report"),
            ),
          ],
        ),
      ),
    );
  }
}
