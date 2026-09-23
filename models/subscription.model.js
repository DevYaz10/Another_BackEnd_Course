import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription Name is required"],
      trim: true,
      minLength: [3, "Subscription Name must be at least 3 characters long"],
      maxLength: [100, "Subscription Name must be at most 100 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Subscription Price is required"],
      min: [0, "Subscription Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["SAR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"],
      default: "SAR",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      enum: [
        "sports",
        "entertainment",
        "education",
        "news",
        "lifestyle",
        "other",
      ],
      required: [true, "Subscription Category is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "other"],
      default: "credit_card",
      required: [true, "Subscription Payment Method is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "canceled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, //? i really don't understand this line but this is how u can reference another model in mongoose
      ref: "User", //? this is the name of the model that we are referencing
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Auto-calulate renewal date if missing
//* this is kinda like a middleware if you think about it
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalDate = new Date(this.startDate);
    switch (this.frequency) {
      case "daily": renewalDate.setDate(renewalDate.getDate() + 1); break;
      case "weekly": renewalDate.setDate(renewalDate.getDate() + 7); break;
      case "monthly": renewalDate.setMonth(renewalDate.getMonth() + 1); break;
      case "yearly": renewalDate.setFullYear(renewalDate.getFullYear() + 1); break;
    }
    this.renewalDate = renewalDate;
  }

  // Auto-update status if renewal date has passed
  if (this.status === "active" && this.renewalDate < new Date()) {
  this.status = "expired";
}

});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
