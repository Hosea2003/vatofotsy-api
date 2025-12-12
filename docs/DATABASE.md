# Database Setup and Migrations

## TypeORM Configuration

This project uses TypeORM with automatic entity discovery and migrations.

### Features

- **Auto Entity Discovery**: Entities are automatically discovered using the pattern `dist/**/*.entity{.ts,.js}`
- **Migrations**: Database schema changes are managed through migrations
- **No Manual Registration**: You don't need to manually add each entity to the configuration

### Migration Commands

```bash
# Generate a new migration (based on entity changes)
pnpm run migration:generate src/migrations/CreateSomethingTable

# Create an empty migration file
pnpm run migration:create src/migrations/CreateSomethingTable

# Run pending migrations
pnpm run migration:run

# Revert the last migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show
```

### Database Setup

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` and configure your database connection
3. Run migrations: `pnpm run migration:run`

### Adding New Entities

1. Create your entity file with the `.entity.ts` suffix anywhere in the `src` directory
2. Use TypeORM decorators as needed
3. Generate a migration: `pnpm run migration:generate -- -n YourEntityName`
4. Run the migration: `pnpm run migration:run`

### Example Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('your_table_name')
export class YourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

The entity will be automatically discovered and registered with TypeORM.
