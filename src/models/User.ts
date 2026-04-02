import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

const UserSchema = new Schema(
  {
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN", "USER"], required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },

    // For role USER: which Admin created/owns this user.
    // For role ADMIN: which Super Admin created them (optional; stored for audit).
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdBy: 1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDoc> = (mongoose.models.User as Model<UserDoc>) || mongoose.model("User", UserSchema);

