const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default:'Hey,I am New' 
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'post'
    }]

}, { timestamps: true });

module.exports = mongoose.model("user",UserSchema);

