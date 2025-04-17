import { z } from 'zod';

/**
 * Schema validation utility for checking field names against database schema
 * 
 * This utility provides functions to validate data against predefined schemas
 * and to check if field names exist in a given schema.
 */

// Generic type for database schema definitions
export type SchemaDefinition = Record<string, any>;

/**
 * Validates if a field name exists in the given schema
 * @param fieldName The field name to check
 * @param schema The schema definition to check against
 * @returns Boolean indicating if the field exists in the schema
 */
export function fieldExistsInSchema(fieldName: string, schema: SchemaDefinition): boolean {
  return fieldName in schema;
}

/**
 * Validates an object against a schema definition
 * @param data The data object to validate
 * @param schema The schema definition to validate against
 * @returns Object with validation results and any errors
 */
export function validateAgainstSchema<T extends Record<string, any>>(
  data: T,
  schema: SchemaDefinition
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for fields in data that don't exist in schema
  Object.keys(data).forEach(field => {
    if (!fieldExistsInSchema(field, schema)) {
      errors.push(`Field "${field}" does not exist in schema`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a Zod schema from a database schema definition
 * @param schema The database schema definition
 * @returns A Zod schema that can be used for runtime validation
 */
export function createZodSchemaFromDefinition(schema: SchemaDefinition): z.ZodObject<any> {
  const zodSchema: Record<string, z.ZodTypeAny> = {};
  
  Object.entries(schema).forEach(([fieldName, fieldDefinition]) => {
    // Map database types to Zod types
    if (typeof fieldDefinition === 'object' && fieldDefinition !== null) {
      if ('type' in fieldDefinition) {
        switch (fieldDefinition.type) {
          case 'string':
            zodSchema[fieldName] = z.string();
            break;
          case 'number':
            zodSchema[fieldName] = z.number();
            break;
          case 'boolean':
            zodSchema[fieldName] = z.boolean();
            break;
          case 'date':
            zodSchema[fieldName] = z.date();
            break;
          default:
            zodSchema[fieldName] = z.any();
        }
      } else {
        zodSchema[fieldName] = z.any();
      }
    } else {
      // Default to any if type information is not available
      zodSchema[fieldName] = z.any();
    }
  });
  
  return z.object(zodSchema);
}

/**
 * Validates data against a Zod schema
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @returns Object with validation results and any errors
 */
export function validateWithZod<T>(
  data: T,
  schema: z.ZodType<T>
): { isValid: boolean; errors: string[] } {
  try {
    schema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
} 