import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Bumped whenever the password changes. Session and Password reset tokens
    // embed the version they were minted against, so a bump revokes both.
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "tokenVersion must be an integer",
      },
    },

    // The Cart is a list of Cart lines: `{ productId, size, quantity, design? }`.
    // Mixed because carts saved before Custom Tees were orderable hold the old
    // `{ [productId]: { [size]: quantity } }` object; `cartLines()` in
    // @forever/shared reads both.
    cartData: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    minimize: false,
  }
);

const UserModel = mongoose.model.user || mongoose.model('User', userSchema);

export default UserModel;
