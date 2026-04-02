import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, createdAt: -1 });

export type NoteDoc = InferSchemaType<typeof NoteSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Note: Model<NoteDoc> = (mongoose.models.Note as Model<NoteDoc>) || mongoose.model("Note", NoteSchema);

