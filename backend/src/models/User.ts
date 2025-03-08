import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// user roles
export enum UserRole {
  ADMIN = 'admin',
}

// user interface
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  teamName: string;
  role: UserRole;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: [6, 'password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    teamName: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.ADMIN,
    },
  },
  {
    timestamps: true,
  }
);

// hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 