DELETE FROM "products";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "brand";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "created_at";