import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
    required: [true, "fullname is required"],
  },
  password: {
    type: String,
    trim: true,
    required: [true, "password is required"],
    select : false,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "email is required"],
  },
  phone: {
    type: String,
    trim: true,
    required: [true, "phone is required"],
  },
},
{
    timestamps: true
});

// Use async bcrypt.hash — hashSync blocks the event loop and makes signup very slow
UserSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePass = async function(password) {
  return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;