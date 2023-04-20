const BD = require('./models/post')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

class User {
    static type = 'User'

    constructor(options){
        this.id = options.id
        this.username = options.username
        this.lastActiv = options.lastActiv
        this.lastText = options.lastText
        this.lastMedia = options.lastMedia
        this.step = options.step
    }
    async setOptionUser(option, value){
        if(option !== 'id'){
            this[option] = value
            this.lastActiv = Date.now()
            await BD.updateOne({id: this.id}, {[option]: value, 'lastActiv': Date.now()})
        }
        else{
            console.log('id error')
        }
    }
    async subOnOff(value){
            this.lastActiv = Date.now()
            if(value == true){
               await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {'subChannelUsers': this.id}}) 
            }
            else if(value == false){
                await BD.updateOne({baza: 'dataBaze'}, {$pull: {'subChannelUsers': this.id}})
            }
            await BD.updateOne({id: this.id}, {'lastActiv': Date.now()})
    }
    async payOnOff(value){
        this.lastActiv = Date.now()
        if(value == true){
           await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {'paidUsers': this.id}}) 
        }
        else if(value == false){
            await BD.updateOne({baza: 'dataBaze'}, {$pull: {'paidUsers': this.id}})
        }
        await BD.updateOne({id: this.id}, {'lastActiv': Date.now()})
    }
    async getPayStatus(){
        const ar = (await BD.findOne({baza: 'dataBaze'}, {paidUsers: 1, _id: 0})).paidUsers
        if(ar.includes(this.id)){
            return true
        }
        else{
            return false
        }
    }
    async getSubStatus(){
        const ar = (await BD.findOne({baza: 'dataBaze'}, {subChannelUsers: 1, _id: 0})).subChannelUsers
        if(ar.includes(this.id)){
            return true
        }
        else{
            return false
        }
    }
}

class Course {
    static type = 'Course'

    constructor(options){
        this.idC = options.idC
        this.courseName = options.courseName
        this.courseLike = options.courseLike
        this.series = options.series
        this.payStatus = options.payStatus
        this.statusOn = options.statusOn
    }
    async dell(allCourses){
        await BD.updateOne({baza: 'dataBaze'}, {$pull: {courses: allCourses.filter(item => item.idC == this.idC)[0]}})
        allCourses.splice(allCourses.findIndex(item => item.idC == this.idC), 1)
        console.log(allCourses)
       
    }
    async onOff(allCourses){
        if(this.statusOn == true){
            this.statusOn = false
        }
        else if(this.statusOn == false){
            this.statusOn = true
        }
        allCourses.find(item => item.idC == this.idC).statusOn = this.statusOn
        const courses = (await BD.findOne({baza: 'dataBaze'}, {courses: 1 ,_id: 0})).courses
        courses.find(item => item.idC == this.idC).statusOn = this.statusOn
        await BD.updateOne({baza: 'dataBaze'}, {courses: courses})
    }
    async pay(allCourses){
        if(this.payStatus == true){
            this.payStatus = false
        }
        else if(this.payStatus == false){
            this.payStatus = true
        }
        allCourses.find(item => item.idC == this.idC).payStatus = this.payStatus
        const courses = (await BD.findOne({baza: 'dataBaze'}, {courses: 1 ,_id: 0})).courses
        courses.find(item => item.idC == this.idC).payStatus = this.payStatus
        await BD.updateOne({baza: 'dataBaze'}, {courses: courses})
    }
    async addSeries(allCourses, file_id, file_name, idC){
        allCourses.find(item => item.idC == this.idC).series.push({'type': 'video', 'media': file_id, 'caption': file_name})
        const courses = (await BD.findOne({baza: 'dataBaze'}, {courses: 1 ,_id: 0})).courses
        courses.find(item => item.idC == this.idC).series.push({'type': 'video', 'media': file_id, 'caption': file_name, idC: idC})
        await BD.updateOne({baza: 'dataBaze'}, {courses: courses})
    }
}
exports.User = User
exports.Course = Course
