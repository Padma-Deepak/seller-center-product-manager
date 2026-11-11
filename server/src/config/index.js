export const config = {
  port: Number(process.env.PORT) || 3001,
  env: process.env.NODE_ENV || 'development',
  defaultPageSize: 20,
  maxPageSize: 100,
}
