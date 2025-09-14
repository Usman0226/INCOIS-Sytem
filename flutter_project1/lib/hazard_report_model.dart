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
}
