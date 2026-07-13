CREATE TABLE "note_labels" (
	"note_id" serial NOT NULL,
	"label_id" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note_labels" ADD CONSTRAINT "note_labels_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_labels" ADD CONSTRAINT "note_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;