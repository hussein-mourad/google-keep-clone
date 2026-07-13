import z from "zod";

export const envSchema = z.object({
  PORT: z.string().optional().default("8000"),
  BASE_URL: z.string().optional(),
  FRONTEND_URL: z.string(),
  DATABASE_URL: z.string(),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export function validateEnv(config: Record<string, any>) {
  try {
    const result = envSchema.parse(config);
    return result;
  } catch (error) {
    const issues = (error as z.ZodError).issues.map((issue) => {
      return `Field: ${issue.path.join(".")} - ${issue.message}`;
    });
    throw new Error(`Env validation error: \n${issues.join("\n")}`);
  }
}

const env = validateEnv(process.env);

export type Env = z.infer<typeof envSchema>;
export type EnvKeys = keyof Env;

export default env;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env { }
  }
}
