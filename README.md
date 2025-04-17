# PIMS - Property Inventory Management System

## Recent Improvements

### Schema Validation

We've implemented a schema validation utility that automatically checks field names against the database schema. This helps catch errors early and ensures data consistency.

Key features:
- Field existence validation
- Type validation
- Integration with Zod for runtime validation
- Detailed error reporting

### Error Boundaries

We've added error boundaries throughout the application to gracefully handle rendering errors. This prevents the entire application from crashing when a component fails.

Benefits:
- Improved user experience
- Better error reporting
- Easier debugging
- Graceful degradation

### TypeScript Type Safety

We've enhanced the TypeScript interfaces and type definitions to provide better compile-time type checking.

Improvements:
- Comprehensive interfaces for all data structures
- Proper typing for component props
- Consistent naming conventions
- Documentation for all types

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

- `src/components` - Reusable UI components
- `src/pages` - Page components and routes
- `src/hooks` - Custom React hooks
- `src/utils` - Utility functions
- `src/integrations` - External service integrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
