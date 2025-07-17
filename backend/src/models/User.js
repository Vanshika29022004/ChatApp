import mongoose from "mongoose";
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    }
    ,email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    learningLanguage: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false, 
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
},{timestamps:true});
//createdAt , updatedAt


//pre hook
// john@gmai.com 123456 => not read format 

userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) {
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
        
    }catch(err) {
        console.error("Error hashing password:", err);
        next(err);
    }

});

userSchema.methods.matchPassword = async function(enteredpassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredpassword, this.password);
    return isPasswordCorrect;
}

const User = mongoose.model("User", userSchema);

export default User;