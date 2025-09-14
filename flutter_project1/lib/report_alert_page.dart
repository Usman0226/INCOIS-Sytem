import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ReportAlertPage extends StatelessWidget {
  const ReportAlertPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Dashboard"),
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
        child: ElevatedButton(
          child: Text("Report Hazard"),
          onPressed: () {
            context.push('/hazardReport');
          },
        ),
      ),
    );
  }
}
