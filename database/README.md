# Database - Schemas, Seeds, & Migrations

This folder contains database-related definitions, migration scripts, and seed datasets for the **AI-Powered Waste Management & Recycling Optimizer**.

---

## 📌 Planned Data Entities

- **Bin Information:**
  - Bin ID, location (latitude/longitude), address, capacity, bin type (organic, recyclable, general, hazardous), installation date, sensor ID.
- **Historical Fill Levels:**
  - Timestamped sensor logs, fill percentage, weight, battery level, status flags.
- **Waste Data & Categorization:**
  - Waste categories, recycling guidelines, contamination rates, material breakdown.
- **Collection Records:**
  - Pickup logs, collection timestamps, driver/vehicle IDs, volume/weight emptied, route IDs.
- **Vehicle Information:**
  - Vehicle ID, license plate, capacity, fuel type, operational status, assigned driver.
- **Prediction Results:**
  - Forecasted fill levels, overflow risk probability, predicted collection due dates, model version.

---

## 📁 Directory Structure

```text
database/
├── schemas/       # DDL scripts, SQL schema definitions, or table models
├── seed/          # Initial seed data (CSV/JSON/SQL) for local development & testing
├── migrations/    # Schema migration scripts (e.g. Alembic, Prisma, Flyway)
└── README.md      # Database documentation
```

---

## 🛠️ Database Setup (Planned)

- **Database Engine:** PostgreSQL (with PostGIS for geospatial route and bin queries) / SQLite for local testing
- **Migration Tool:** Alembic
