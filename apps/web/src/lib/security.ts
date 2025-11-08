// Security utilities and validation
import Joi from 'joi';

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Input validation schemas
export const schemas = {
  // Event registration validation
  eventRegistration: Joi.object({
    event_id: Joi.string().uuid().required(),
    registration_type: Joi.string().valid('individual', 'team').default('individual'),
    team_id: Joi.alternatives().try(
      Joi.string().uuid(),
      Joi.string().allow('', null),
      Joi.allow(null)
    ).optional(),
    team_members: Joi.alternatives().try(
      Joi.array().items(Joi.string().uuid()),
      Joi.array().items(Joi.string()),
      Joi.allow(null)
    ).optional(),
    emergency_contact: Joi.alternatives().try(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).required()
      }),
      Joi.allow(null)
    ).optional(),
    dietary_requirements: Joi.alternatives().try(
      Joi.string().max(500),
      Joi.allow('', null)
    ).optional(),
    medical_conditions: Joi.alternatives().try(
      Joi.string().max(1000),
      Joi.allow('', null)
    ).optional(),
    experience_level: Joi.alternatives().try(
      Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
      Joi.allow('', null)
    ).optional(),
    motivation: Joi.alternatives().try(
      Joi.string().min(10).max(1000),
      Joi.string().allow(''),
      Joi.allow(null)
    ).optional(),
    additional_notes: Joi.alternatives().try(
      Joi.string().max(1000),
      Joi.allow('', null)
    ).optional()
  }),

  // Personal record validation
  personalRecord: Joi.object({
    sport_category_id: Joi.string().uuid().required(),
    category: Joi.string().min(2).max(100).required(),
    value: Joi.number().positive().required(),
    unit: Joi.string().min(1).max(20).required(),
    description: Joi.string().max(1000).optional(),
    achievement_date: Joi.date().iso().max('now').required(),
    location: Joi.string().max(200).optional(),
    event_context: Joi.string().max(500).optional(),
    weather_conditions: Joi.string().max(200).optional(),
    equipment_used: Joi.string().max(300).optional(),
    verification_method: Joi.string().valid('video', 'witness', 'official').default('video'),
    primary_video_id: Joi.string().uuid().optional(),
    secondary_videos: Joi.array().items(Joi.string().uuid()).max(5).optional(),
    is_public: Joi.boolean().default(true)
  }),

  // User profile validation
  userProfile: Joi.object({
    first_name: Joi.string().min(1).max(50).optional(),
    last_name: Joi.string().min(1).max(50).optional(),
    display_name: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).max(20).optional(),
    date_of_birth: Joi.date().iso().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    state: Joi.string().max(50).optional(),
    city: Joi.string().max(50).optional(),
    address: Joi.string().max(200).optional(),
    pincode: Joi.string().pattern(/^\d{6}$/).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }),

  // Team creation validation
  team: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    sport: Joi.string().min(2).max(30).required(),
    description: Joi.string().max(500).optional(),
    max_members: Joi.number().integer().min(2).max(50).required(),
    is_public: Joi.boolean().default(true),
    requirements: Joi.string().max(300).optional()
  })
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
}

// Validate request against schema
export function validateRequest(data: any, schema: Joi.ObjectSchema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new Error(`Validation error: ${errors.join(', ')}`);
  }

  return value;
}

// Security headers middleware data
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Check if user has required permissions
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'athlete': 1,
    'coach': 2,
    'official': 3,
    'admin': 4
  };

  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
}