import Joi from "joi";

export const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default("api/v1"),
  FRONTEND_ORIGINS: Joi.string().required(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgres", "postgresql"] })
    .required(),
  DIRECT_URL: Joi.string()
    .uri({ scheme: ["postgres", "postgresql"] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(64).required(),
  JWT_REFRESH_SECRET: Joi.string()
    .min(64)
    .required()
    .invalid(Joi.ref("JWT_ACCESS_SECRET")),
  JWT_ISSUER: Joi.string().default("cynova-api"),
  JWT_AUDIENCE: Joi.string().default("cynova-web"),
  JWT_ACCESS_TTL: Joi.string().default("15m"),
  JWT_REFRESH_TTL: Joi.string().default("14d"),
  COOKIE_SECURE: Joi.boolean().truthy("true").falsy("false").default(false),
  COOKIE_SAME_SITE: Joi.string().valid("lax", "strict").default("lax"),
  COOKIE_DOMAIN: Joi.string().allow("").default(""),
  SWAGGER_ENABLED: Joi.boolean().truthy("true").falsy("false").default(true),
  LOG_LEVEL: Joi.string().default("info"),
  ENABLE_DEV_FAILURE_SIMULATION: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),
});
