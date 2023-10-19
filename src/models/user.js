import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
      userEmail: { type: String, required: true },
      userPassword: { type: String, required: true },
      userBiologicalGender: { type: String, required: false },
      userBD: { type: String, required: false },
      userWeight: { type: Number, required: false },
      userHeight: { type: Number, required: false },
      userActivities: { type: Array, required: false },
    },
    { timestamps: true }
  );
  
  const User = mongoose.model("User", userSchema);

  export default User;