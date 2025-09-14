import 'package:image_picker/image_picker.dart';

class HazardReport {
  final String? hazardType;
  final String? description;
  final String? location;
  final XFile? mediaFile;

  HazardReport({
    required this.hazardType,
    required this.description,
    required this.location,
    this.mediaFile,
  });

  // Convert to JSON for API submission
  Map<String, dynamic> toJson() {
    Map<String, dynamic> json = {};
    
    // Combine hazard type and description for text field
    String text = '';
    if (hazardType != null) {
      text = hazardType!;
      if (description != null && description!.isNotEmpty) {
        text += ': $description';
      }
    } else if (description != null && description!.isNotEmpty) {
      text = description!;
    }
    
    if (text.isNotEmpty) {
      json['text'] = text;
    }

    // Parse location to lat/lon
    if (location != null) {
      final locationParts = location!.split(', ');
      if (locationParts.length >= 2) {
        final lat = locationParts[0].replaceAll('Lat: ', '');
        final lon = locationParts[1].replaceAll('Lng: ', '');
        json['lat'] = lat;
        json['lon'] = lon;
      }
    }

    // Handle media file URLs (will be set after upload)
    json['image_url'] = [];
    json['video_url'] = [];

    return json;
  }

  // Create from JSON
  factory HazardReport.fromJson(Map<String, dynamic> json) {
    return HazardReport(
      hazardType: json['hazardType'],
      description: json['description'],
      location: json['location'],
      mediaFile: null, // XFile cannot be serialized from JSON
    );
  }

  // Copy with method for updating report
  HazardReport copyWith({
    String? hazardType,
    String? description,
    String? location,
    XFile? mediaFile,
  }) {
    return HazardReport(
      hazardType: hazardType ?? this.hazardType,
      description: description ?? this.description,
      location: location ?? this.location,
      mediaFile: mediaFile ?? this.mediaFile,
    );
  }
}
