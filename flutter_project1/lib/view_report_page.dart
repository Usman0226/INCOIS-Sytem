import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'hazard_report_model.dart';
import 'package:image_picker/image_picker.dart';

class ViewReportPage extends StatelessWidget {
  const ViewReportPage({super.key});

  @override
  Widget build(BuildContext context) {
    final report = GoRouterState.of(context).extra as HazardReport?;

    if (report == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Report Not Found"),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12.0),
              child: Image.asset('assets/logo_(1)[1].png', width: 36),
            ),
          ],
        ),
        body: const Center(child: Text("Could not find the report data.")),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Your Submitted Report"),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow("Hazard Type:", report.hazardType),
            _buildDetailRow("Description:", report.description),
            _buildDetailRow("Location:", report.location),
            const SizedBox(height: 20),
            if (report.mediaFiles != null && report.mediaFiles!.isNotEmpty) ...[
              Text(
                "Attached Media:",
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  for (final file in report.mediaFiles!)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: buildMediaPreview(file),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget buildMediaPreview(XFile file) {
    if (file.mimeType?.startsWith('image') ?? false) {
      if (kIsWeb) {
        return FutureBuilder<Uint8List>(
          future: file.readAsBytes(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
              return Image.memory(
                snapshot.data!,
                fit: BoxFit.cover,
                height: 250,
                width: 250,
              );
            } else {
              return const SizedBox(
                height: 80,
                width: 80,
                child: Center(child: CircularProgressIndicator()),
              );
            }
          },
        );
      } else {
        return Image.file(
          File(file.path),
          fit: BoxFit.cover,
          height: 250,
          width: 250,
        );
      }
    } else {
      // Video or unsupported type
      return Container(
        height: 250,
        width: 250,
        color: Colors.black12,
        child: const Center(child: Icon(Icons.videocam, size: 60, color: Colors.blueGrey)),
      );
    }
  }

  Widget _buildDetailRow(String label, String? value) {
    if (value == null || value.isEmpty) {
      return const SizedBox.shrink();
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text.rich(
        TextSpan(
          text: '$label ',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          children: [
            TextSpan(
              text: value,
              style: const TextStyle(fontWeight: FontWeight.normal),
            ),
          ],
        ),
      ),
    );
  }
}
