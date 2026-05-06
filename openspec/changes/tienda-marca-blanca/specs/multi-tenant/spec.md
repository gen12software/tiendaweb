## REMOVED Requirements

### Requirement: Aislamiento multi-tenant por STORE_ID
**Reason**: El modelo de entrega cambió a un deploy por cliente. Cada cliente tiene su propia base de datos Supabase independiente, por lo que no es necesario aislar datos por `store_id`. Ver `design.md` D1.
**Migration**: No aplica — nunca se implementó.
