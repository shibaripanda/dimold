const { Telegraf, Markup } = require('telegraf')
const { fix } = require('./const')
const BD = require('./models/post')
const { User, Course } = require('./class.js')

const keys = {

    forPayUser: async function () {
        return Markup.inlineKeyboard(await mark.listCoursesForPay(await mark.uploadCoursesFromMongo()))
    },
    forSubUser: async function () {
        return Markup.inlineKeyboard(await mark.listCoursesForSub(await mark.uploadCoursesFromMongo()))
    },
    forSimpleUser: async function () {
        return Markup.inlineKeyboard(await mark.listCoursesForSimple(await mark.uploadCoursesFromMongo()))
    },
    forAdminUser: async function () {
        return Markup.inlineKeyboard(await mark.listCoursesForAdmin(await mark.uploadCoursesFromMongoAdmin()))
    },
    forEditCourse: async function (course) {
        let flagOn
        if(course.statusOn == true){
            flagOn = `${fix.vkl} 🟢/ ${fix.vikl}`
        }
        else{
            flagOn = `${fix.vkl} /🔴 ${fix.vikl}`
        }

        let flagPay
        if(course.payStatus == true){
            flagPay = `${fix.payText} 💵/ ${fix.notPayText}`
        }
        else{
            flagPay = `${fix.payText} /🆓 ${fix.notPayText}`
        }
        if(course.series.length > 0){
            const list = []
            list.push([Markup.button.callback(`${fix.addSerie}`, `addSeriesToCourse${course.idC}`)])
            for(let i of course.series){
                list.push([Markup.button.callback(`❌ ${fix.dellText}: ${i.caption}`, `delSerie${course.idC}`)])
            }
            list.push([Markup.button.callback(`${flagPay}`, `statusPay${course.idC}`)]),
            list.push([Markup.button.callback(`${flagOn}`, `statusOnOff${course.idC}`)]),
            list.push([Markup.button.callback(`${fix.dellText}`, `dellCourse${course.idC}`)]),
            list.push([Markup.button.callback(`${fix.backText}`, `meinMenu`)])
            return Markup.inlineKeyboard(list)
        }
        else{
           return Markup.inlineKeyboard([
            [Markup.button.callback(`${fix.addSerie}`, `addSeriesToCourse${course.idC}`)],
            [Markup.button.callback(`${flagPay}`, `statusPay${course.idC}`)],
            [Markup.button.callback(`${flagOn}`, `statusOnOff${course.idC}`)],
            [Markup.button.callback(`${fix.dellText}`, `dellCourse${course.idC}`)],
            [Markup.button.callback(`${fix.backText}`, `meinMenu`)]
        ]) 
        }

        
    },
    forLookCourse: async function (course) {
        if(course.series.length > 0){
            const list = []
            list.push([Markup.button.callback(`👍`, `likeCourse${course.idC}`)])
            for(let i of course.series){
                list.push([Markup.button.callback(`${i.caption}`, `showSer${i.idC}`)])
            }
            list.push([Markup.button.callback(`${fix.backText}`, `meinMenu`)])
            return Markup.inlineKeyboard(list)
        } 
    }
}

const mark = {
    listCoursesForAdmin: async function (allCourses){
        const list = []
        list.push([Markup.button.callback(`${fix.addCourse}`, 'adCourse')])
        for(let i of allCourses){
            let flagOn
        if(i.statusOn == true){
            flagOn = `🟢`
        }
        else{
            flagOn = `🔴`
        }

        let flagPay
        if(i.payStatus == true){
            flagPay = `💵`
        }
        else{
            flagPay = `🆓`
        }
            list.push([Markup.button.callback(`${flagOn}` + `${flagPay} ` + `(${i.series.length})` + ' ' + i.courseName, `courseSettings${i.idC}`)])
        }
        // list.push([Markup.button.callback(`${fix.courses}`, 'ggg')])
        return list
    },
    listCoursesForSimple: async function (allCourses){
        const list = []
        list.push([Markup.button.url(`${fix.toSubText}`, fix.linkSub)])
        for(let i of allCourses.filter(item => item.statusOn == true)){
            let flagOn
        if(i.statusOn == true){
            flagOn = `🟢`
        }
        else{
            flagOn = `🔴`
        }

        let flagPay
        if(i.payStatus == true){
            flagPay = `💵`
        }
        else{
            flagPay = `🆓`
        }
            list.push([Markup.button.callback(`🔒 ` + i.courseName, `zero`)])
        }
        // list.push([Markup.button.callback(`${fix.courses}`, 'ggg')])
        return list
    },
    listCoursesForSub: async function (allCourses){
        const list = []
        list.push([Markup.button.url(`${fix.buyText}`, fix.buyLink)])
        for(let i of allCourses.filter(item => item.statusOn == true)){
        let flagPay
        let link
        if(i.payStatus == true){
            flagPay = `🔒`
            link = 'zero'
        }
        else{
            flagPay = `🆓`
            link = 'look' + i.idC
        }
            list.push([Markup.button.callback(`${flagPay} ` + i.courseName, link)])
        }
        // list.push([Markup.button.callback(`${fix.courses}`, 'ggg')])
        return list
    },
    listCoursesForPay: async function (allCourses){
        const list = []
        for(let i of allCourses.filter(item => item.statusOn == true)){
            list.push([Markup.button.callback(`✅ ` + i.courseName, 'look' + i.idC)])
        }
        // list.push([Markup.button.callback(`${fix.courses}`, 'ggg')])
        return list
    },
    uploadCoursesFromMongo: async function (){
        return ((await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses).filter(item => item.series.length > 0) 
    },
    uploadCoursesFromMongoAdmin: async function (){
        return (await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses
    },
    classCourses: async function (coursesAr){
        let allCourses = []
        for(let i of coursesAr){
            allCourses.push(new Course(i))
        }
        return allCourses
    }
}

exports.keys = keys