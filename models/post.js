const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoName =  (process.env.MONGO_COLLECTION)

const BazaSchema = new Schema({
id: {
    type: Number,
    required: true,
},
username: {
    type: String,
    required: true,
},
baza: {
    type: String,
    required: true
},
perezapuskJs: {
    type: Number,
    required: true,
},
lastActiv: {
    type: Number,
    required: true,
},
logo: {
    type: Object,
    required: true,
},
video: {
    type: Object,
    required: true,
},
lastText: {
    type: Number,
    required: true,
},
lastMedia: {
    type: Number,
    required: true,
},
subChannelUsers: {
    type: Array,
    required: true,
},
paidUsers: {
    type: Array,
    required: true,
},
admins: {
    type: Array,
    required: true,
},
courses: {
    type: Array,
    required: true,
},
step: {
    type: String,
    required: true,
},
idC: {
    type: Number,
    required: true,
},
point: {
    type: Number,
    required: true,
},
statusPayAfterScreen: {
    type: Boolean,
    required: true,
},
techMes: {
    type: Number,
    required: true,
}
}, {timestamps: true})


const BD = mongoose.model(`${mongoName}`, BazaSchema);
module.exports = BD