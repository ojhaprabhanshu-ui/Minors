import mongoose from "mongoose";
import bcrypt , {compare, compareSync} from "bcrypt";

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
  },
  email: { 
    type: String,
     trim: true, 
     required: [true, "email is required"] },
  phone: {
    type: String,
    trim: true,
    required: [true, "username is required"],
  },
},
{
    timestamps :true
});

UserSchema.pre("save" ,function(){
  this.password = bcrypt.hashSync(this.password , 10)
})

UserSchema.methods.comparePass = function(password){
  return bcrypt.compareSync(password , this.password)
}

const UserModel = mongoose.model("users" , UserSchema)
export default UserModel