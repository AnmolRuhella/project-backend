import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // one who is subscriping
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // one to whom subscriber is subscriping
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subcription", subscriptionSchema);
