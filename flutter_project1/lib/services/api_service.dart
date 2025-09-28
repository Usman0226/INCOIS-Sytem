import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../hazard_report_model.dart';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  // static const String baseUrl = 'http://localhost:3000';
  static const String baseUrl = 'https://incois-system.onrender.com';
  late Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));
    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
      ));
    }
  }

  // Submit hazard report to backend

Future<Map<String, dynamic>> submitHazardReport({
  required HazardReport report,
  String? authToken,
}) async {
  try {
    if (authToken != null) {
      _dio.options.headers['Authorization'] = 'Bearer $authToken';
    }

    FormData formData = FormData();

    // Text and location fields (as in your current logic)
    formData.fields.add(MapEntry('text', report.reportText));
    if (report.hazardType?.isNotEmpty ?? false) {
      formData.fields.add(MapEntry('hazardType', report.hazardType!));
    }
    if (report.location != null) {
      final locationParts = report.location!.split(', ');
      if (locationParts.length >= 2) {
        final lat = locationParts[0].replaceAll('Lat: ', '');
        final lon = locationParts[1].replaceAll('Lng: ', '');
        formData.fields.add(MapEntry('lat', lat));
        formData.fields.add(MapEntry('lon', lon));
      }
    }

    // Add media files cross-platform
    if (report.mediaFiles != null && report.mediaFiles!.isNotEmpty) {
      for (final fileX in report.mediaFiles!) {
        final fileName = fileX.name;
        final isVideo = fileName.toLowerCase().endsWith('.mp4') ||
                        fileName.toLowerCase().endsWith('.mov') ||
                        fileName.toLowerCase().endsWith('.avi');
        final field = isVideo ? 'video' : 'image';

        if (kIsWeb) {
          Uint8List bytes = await fileX.readAsBytes();
          formData.files.add(MapEntry(
            field,
            MultipartFile.fromBytes(bytes, filename: fileName),
          ));
        } else {
          File file = File(fileX.path);
          formData.files.add(MapEntry(
            field,
            await MultipartFile.fromFile(file.path, filename: fileName),
          ));
        }
      }
    }

    final response = await _dio.post(
      '/user/submit/report',
      data: formData,
      options: Options(
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      ),
    );

    if (response.statusCode == 201) {
      return {
        'success': true,
        'message': response.data['message'] ?? 'Report submitted successfully',
        'data': response.data['data'],
      };
    } else {
      return {
        'success': false,
        'message': response.data['message'] ?? 'Failed to submit report',
      };
    }
  } catch (e) {
    return {
      'success': false,
      'message': 'An error occurred: ${e.toString()}',
    };
  }
}


  // Phone/OTP Authentication
  Future<Map<String, dynamic>> registerUser({
    required String name,
    required String phone,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/user/register',
        data: {
          'name': name,
          'phone': phone,
        },
      );
      return {
        'success': response.statusCode == 201 || response.statusCode == 200,
        'message': response.data['message'] ?? 'Registration initiated',
        'phone': response.data['phone'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Registration failed',
      };
    }
  }

  Future<Map<String, dynamic>> resendOtp({required String phone}) async {
    try {
      final response = await _dio.post(
        '/api/auth/resend-otp',
        data: {'phone': phone},
      );
      return {
        'success': response.statusCode == 200,
        'message': response.data['message'] ?? 'OTP sent',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Failed to send OTP',
      };
    }
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/verify-otp',
        // *** THIS IS THE FIX ***
        // Send the OTP as an integer so it matches your backend check
        data: {'phone': phone, 'otp': int.parse(otp)},
      );
      return {
        'success': response.statusCode == 200,
        'message': response.data['message'] ?? 'OTP verified',
        'token': response.data['token'],
        'user': response.data['user'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'OTP verification failed',
      };
    }
  }

  Future<Map<String, dynamic>> loginWithPhone({required String phone}) async {
    try {
      final response = await _dio.post(
        '/api/auth/user/login',
        data: {'phone': phone},
      );
      return {
        'success': response.statusCode == 200,
        'message': response.data['message'] ?? 'Login successful',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Login failed',
      };
    }
  }
}