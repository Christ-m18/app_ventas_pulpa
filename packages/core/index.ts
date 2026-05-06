/**
 * @pulpas/core — Domain package entry point.
 * This package has ZERO dependencies on UI frameworks or infrastructure.
 * Only depends on Zod for runtime validation.
 */

// Domain Entities & Schemas
export * from './domain/entities';

// Repository Interfaces (Ports)
export * from './domain/repositories';

// Use Cases (Application Logic)
export * from './use-cases';
