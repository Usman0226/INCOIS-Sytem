import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'hazard_report_model.dart';
import 'services/api_service.dart';

class HazardReportPage extends StatefulWidget {
  const HazardReportPage({super.key});

  @override
  State<HazardReportPage> createState() => _HazardReportPageState();
}

class _HazardReportPageState extends State<HazardReportPage> {
  final _formKey = GlobalKey<FormState>();
  String? selectedHazard;
  final List<String> hazards = ["Tsunami", "Rip Currents", "Cyclone"];
  final TextEditingController descriptionController = TextEditingController();

  String? currentLocation;
  final List<XFile> mediaFiles = [];
  bool isRecording = false;
  bool isSubmitting = false;

  final ApiService _apiService = ApiService();

  @override
  void dispose() {
    descriptionController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Location services are disabled.")),
      );
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Location permissions are denied")),
        );
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Location permissions are permanently denied."),
        ),
      );
      return;
    }

    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    setState(() {
      currentLocation = "Lat: ${position.latitude}, Lng: ${position.longitude}";
    });

    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("Location detected!")));
  }

  Future<void> _pickMedia(ImageSource source, {bool isVideo = false}) async {
    final picker = ImagePicker();
    XFile? file = isVideo
        ? await picker.pickVideo(source: source)
        : await picker.pickImage(source: source);
    if (file != null) {
      setState(() => mediaFiles.add(file));
    }
  }

  void _removeMedia(int index) {
    setState(() => mediaFiles.removeAt(index));
  }

  void _onVoiceButtonPressed() {
    setState(() => isRecording = !isRecording);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isRecording
              ? "Voice recording started..."
              : "Voice recording stopped.",
        ),
        backgroundColor: Colors.redAccent,
      ),
    );
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;
    if (currentLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Please detect your location before submitting the report.",
          ),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    setState(() => isSubmitting = true);

    try {
      final report = HazardReport(
        hazardType: selectedHazard,
        description: descriptionController.text,
        location: currentLocation,
        mediaFiles: List<XFile>.from(mediaFiles),
      );

      final result = await _apiService.submitHazardReport(report: report);

      if (!mounted) return;
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/success', extra: report);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Failed to submit report: ${e.toString()}"),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Report Hazard"),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Image.asset('assets/logo_(1)[1].png', width: 36),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<String>(
                value: selectedHazard,
                validator: (value) => value == null || value.isEmpty
                    ? 'Please select a hazard.'
                    : null,
                decoration: const InputDecoration(
                  labelText: "Select Hazard",
                  border: OutlineInputBorder(),
                ),
                items: hazards
                    .map(
                      (hazard) =>
                          DropdownMenuItem(value: hazard, child: Text(hazard)),
                    )
                    .toList(),
                onChanged: (value) => setState(() => selectedHazard = value),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: "Description (optional)",
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(180, 48),
                    ),
                    onPressed: _getCurrentLocation,
                    icon: const Icon(Icons.location_on),
                    label: const Text("Detect Location"),
                  ),
                  const SizedBox(width: 12),
                  if (currentLocation != null)
                    const Icon(Icons.check_circle, color: Colors.green),
                ],
              ),
              if (currentLocation != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    "📍 $currentLocation",
                    style: const TextStyle(fontSize: 14, color: Colors.green),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              const SizedBox(height: 16),
              Row(
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(120, 48),
                    ),
                    onPressed: () => _pickMedia(ImageSource.camera),
                    icon: const Icon(Icons.photo_camera),
                    label: const Text("Photo"),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(120, 48),
                    ),
                    onPressed: () =>
                        _pickMedia(ImageSource.gallery, isVideo: true),
                    icon: const Icon(Icons.videocam),
                    label: const Text("Video"),
                  ),
                ],
              ),
              if (mediaFiles.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Wrap(
                    spacing: 8,
                    children: [
                      for (int i = 0; i < mediaFiles.length; ++i)
                        Stack(
                          alignment: Alignment.topRight,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8.0),
                              child:
                                  mediaFiles[i].mimeType?.startsWith('image') ??
                                      false
                                  ? kIsWeb
                                        ? FutureBuilder<Uint8List>(
                                            future: mediaFiles[i].readAsBytes(),
                                            builder: (context, snapshot) {
                                              if (snapshot.connectionState ==
                                                      ConnectionState.done &&
                                                  snapshot.hasData) {
                                                return Image.memory(
                                                  snapshot.data!,
                                                  height: 80,
                                                  width: 80,
                                                  fit: BoxFit.cover,
                                                );
                                              } else {
                                                return const SizedBox(
                                                  height: 80,
                                                  width: 80,
                                                  child: Center(
                                                    child:
                                                        CircularProgressIndicator(),
                                                  ),
                                                );
                                              }
                                            },
                                          )
                                        : Image.file(
                                            File(mediaFiles[i].path),
                                            height: 80,
                                            width: 80,
                                            fit: BoxFit.cover,
                                          )
                                  : Container(
                                      color: Colors.black12,
                                      height: 80,
                                      width: 80,
                                      child: const Center(
                                        child: Icon(
                                          Icons.videocam,
                                          size: 40,
                                          color: Colors.blueGrey,
                                        ),
                                      ),
                                    ),
                            ),
                            GestureDetector(
                              onTap: () => _removeMedia(i),
                              child: Container(
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.red,
                                ),
                                padding: const EdgeInsets.all(4.0),
                                child: const Icon(
                                  Icons.close,
                                  size: 16,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),
              Center(
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: _onVoiceButtonPressed,
                      child: Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isRecording
                              ? Colors.red
                              : const Color.fromARGB(255, 8, 115, 203),
                        ),
                        child: const Icon(
                          Icons.mic,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isRecording ? "Recording..." : "Tap to record voice",
                      style: TextStyle(
                        color: isRecording
                            ? Colors.red
                            : const Color.fromARGB(255, 9, 79, 183),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isSubmitting ? null : _submitReport,
                  child: isSubmitting
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            ),
                            SizedBox(width: 8),
                            Text("SUBMITTING..."),
                          ],
                        )
                      : const Text("SUBMIT REPORT"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
