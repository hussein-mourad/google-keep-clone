CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_pinned_sort_idx" ON "notes" USING btree ("is_pinned","sort_order");--> statement-breakpoint
CREATE INDEX "note_images_note_id_idx" ON "note_images" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "labels_user_id_idx" ON "labels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "note_labels_label_id_idx" ON "note_labels" USING btree ("label_id");