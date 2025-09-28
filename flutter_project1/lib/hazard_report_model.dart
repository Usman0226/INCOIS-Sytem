import 'package:image_picker/image_picker.dart';

/// Represents a user-submitted hazard report with multiple media support.
class HazardReport {
  final String? hazardType;
  final String? description;
  final String? location;
  final List<XFile>? mediaFiles;

  /// Standard constructor
  HazardReport({
    this.hazardType,
    this.description,
    this.location,
    this.mediaFiles,
  });

  /// Combine hazard type and description for a single text field
  String get reportText {
    if ((hazardType?.isNotEmpty ?? false) && (description?.isNotEmpty ?? false)) {
      return '$hazardType: $description';
    } else if (hazardType?.isNotEmpty ?? false) {
      return hazardType!;
    } else {
      return description ?? '';
    }
  }

  /// Converts the instance to a JSON object for backend/API.
  Map<String, dynamic> toJson() {
    double? lat, lon;
    if (location != null) {
      final parts = location!.split(', ');
      if (parts.length == 2) {
        lat = double.tryParse(parts[0].replaceAll('Lat: ', ''));
        lon = double.tryParse(parts[1].replaceAll('Lng: ', ''));
      }
    }
    return {
      'text': reportText,
      'lat': lat,
      'lon': lon,
      // List of local file paths; actual upload handled elsewhere
      'media_files': mediaFiles?.map((f) => f.path).toList() ?? [],
    };
  }

  /// Constructs a HazardReport from a JSON object.
  factory HazardReport.fromJson(Map<String, dynamic> json) {
    return HazardReport(
      hazardType: json['hazardType'] as String?,
      description: json['description'] as String?,
      location: json['location'] as String?,
      // mediaFiles cannot be reconstructed from backend JSON
      mediaFiles: null,
    );
  }

  /// Easy copy for patching report fields.
  HazardReport copyWith({
    String? hazardType,
    String? description,
    String? location,
    List<XFile>? mediaFiles,
  }) {
    return HazardReport(
      hazardType: hazardType ?? this.hazardType,
      description: description ?? this.description,
      location: location ?? this.location,
      mediaFiles: mediaFiles ?? this.mediaFiles,
    );
  }
}
