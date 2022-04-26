import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


//creating a schema
//creating an object userSchema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 30
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,

    },
    privilegeId: {
        type: Number,
        default: 1,

    },
    companyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'company',
        unique: false
    },
    status: {
        type: Number,
        default: 1,

    }


}, {timestamps: true});

//hashing the password ( getting as user input)
//this hashing will happends only password is passed to model before the action(save)
//eg: before saving the user, password is hashed here
userSchema.virtual('pwd').set(function(pwd){
    this.password = bcrypt.hashSync(pwd,10)
});


//user schema related functions
// userSchema.methods = {
//     authenticate : function (password){
//         return bcrypt.compareSync(password, this.password)
//     }
// }
//not written yet

const user = mongoose.model('user', userSchema);
export default user;