import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../hazard_report_model.dart';

class ApiService {
  // static const String baseUrl = 'http://localhost:3000';
  static const String baseUrl = 'https://incois-system.onrender.com';
  late Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      // Remove default Content-Type to avoid conflicts with multipart
    ));

    // Add interceptor for logging in debug mode
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
      // Set authorization header if token is provided
      if (authToken != null) {
        _dio.options.headers['Authorization'] = 'Bearer $authToken';
      }

      FormData formData = FormData();

      // Add text data
      if (report.hazardType != null) {
        formData.fields.add(MapEntry('text', '${report.hazardType}: ${report.description ?? ''}'));
      }

      // Add location data
      if (report.location != null) {
        final locationParts = report.location!.split(', ');
        if (locationParts.length >= 2) {
          final lat = locationParts[0].replaceAll('Lat: ', '');
          final lon = locationParts[1].replaceAll('Lng: ', '');
          formData.fields.add(MapEntry('lat', lat));
          formData.fields.add(MapEntry('lon', lon));
        }
      }

      // Add media file if present
      if (report.mediaFile != null) {
        final file = File(report.mediaFile!.path);
        final fileName = report.mediaFile!.name;
        
        if (fileName.toLowerCase().endsWith('.mp4') || 
            fileName.toLowerCase().endsWith('.mov') || 
            fileName.toLowerCase().endsWith('.avi')) {
          // Video file
          formData.files.add(MapEntry(
            'video',
            await MultipartFile.fromFile(file.path, filename: fileName),
          ));
        } else {
          // Image file
          formData.files.add(MapEntry(
            'image',
            await MultipartFile.fromFile(file.path, filename: fileName),
          ));
        }
      }

      // API call
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
    } on DioException catch (e) {
      String errorMessage = 'Network error occurred';
      
      if (e.response != null) {
        if (e.response!.statusCode == 401) {
          errorMessage = 'Authentication required. Please contact support.';
        } else if (e.response!.statusCode == 403) {
          errorMessage = 'Access denied. Please contact support.';
        } else {
          errorMessage = e.response!.data['message'] ?? 'Server error occurred';
        }
      } else if (e.type == DioExceptionType.connectionTimeout) {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (e.type == DioExceptionType.receiveTimeout) {
        errorMessage = 'Request timeout. Please try again.';
      }

      return {
        'success': false,
        'message': errorMessage,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'An unexpected error occurred: ${e.toString()}',
      };
    }
  }

  // Login method for authentication
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'token': response.data['token'],
          'user': response.data['user'],
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Login failed',
        };
      }
    } on DioException catch (e) {
      String errorMessage = 'Login failed';
      
      if (e.response != null) {
        errorMessage = e.response!.data['message'] ?? 'Invalid credentials';
      }

      return {
        'success': false,
        'message': errorMessage,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'An unexpected error occurred during login',
      };
    }
  }

  // Register method for new users
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/register',
        data: {
          'email': email,
          'password': password,
          'name': name,
        },
      );

      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': response.data['message'] ?? 'Registration successful',
          'user': response.data['user'],
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Registration failed',
        };
      }
    } on DioException catch (e) {
      String errorMessage = 'Registration failed';
      
      if (e.response != null) {
        errorMessage = e.response!.data['message'] ?? 'Registration error';
      }

      return {
        'success': false,
        'message': errorMessage,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'An unexpected error occurred during registration',
      };
    }
  }
}
