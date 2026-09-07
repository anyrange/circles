ALTER TABLE "oauth_access_token" DROP CONSTRAINT "oauth_access_token_client_id_oauth_client_client_id_fkey";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP CONSTRAINT "oauth_access_token_refresh_id_oauth_refresh_token_id_fkey";--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP CONSTRAINT "oauth_consent_client_id_oauth_client_client_id_fkey";--> statement-breakpoint
ALTER TABLE "oauth_refresh_token" DROP CONSTRAINT "oauth_refresh_token_client_id_oauth_client_client_id_fkey";--> statement-breakpoint
DROP TABLE "jwks";--> statement-breakpoint
DROP TABLE "oauth_access_token";--> statement-breakpoint
DROP TABLE "oauth_client";--> statement-breakpoint
DROP TABLE "oauth_consent";--> statement-breakpoint
DROP TABLE "oauth_refresh_token";