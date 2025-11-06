import mongoose from 'mongoose';

export interface IRefreshToken extends mongoose.Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ token: 1, isRevoked: 1 });

// Static methods
refreshTokenSchema.statics.revokeAllForUser = async function (userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

refreshTokenSchema.statics.revokeToken = async function (token: string) {
  return this.updateOne(
    { token },
    { isRevoked: true }
  );
};

refreshTokenSchema.statics.isTokenValid = async function (token: string) {
  const refreshToken = await this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
  return !!refreshToken;
};

interface IRefreshTokenModel extends mongoose.Model<IRefreshToken> {
  revokeAllForUser(userId: mongoose.Types.ObjectId): Promise<any>;
  revokeToken(token: string): Promise<any>;
  isTokenValid(token: string): Promise<boolean>;
}

const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default RefreshToken;