const { Telegraf, Markup } = require('telegraf')
const { fix } = require('./const')
const BD = require('./models/post')
const { User, Course } = require('./class.js')

const keys = {

    forPayUser: Markup.inlineKeyboard([
        [Markup.button.callback(`${fix.channelName}`, 'ggg')],
        [Markup.button.callback(`${fix.channelName}`, 'ggg')]
    ]),
    forSubUser: Markup.inlineKeyboard([
        [Markup.button.callback(`${fix.channelName}`, 'ggg')],
        [Markup.button.callback(`${fix.channelName}`, 'ggg')]
    ]),
    forSimpleUser: Markup.inlineKeyboard([
        [Markup.button.callback(`${fix.channelName}`, 'ggg')],
        [Markup.button.callback(`${fix.channelName}`, 'ggg')]
    ]),
    forAdminUser: async function () {
        return Markup.inlineKeyboard(await mark.listCoursesForAdmin(await mark.uploadCoursesFromMongo()))
    },
    forEditCourse: async function (course) {
        let flagOn
        if(course.statusOn == true){
            flagOn = `Вкл 🟢/ Выкл`
        }
        else{
            flagOn = `Вкл /🔴 Выкл`
        }

        let flagPay
        if(course.payStatus == true){
            flagPay = `Платный 💵/ Бесплатный`
        }
        else{
            flagPay = `Платный /🆓 Бесплатный`
        }
        if(course.series.length > 0){
            const list = []
            list.push([Markup.button.callback(`Добавить серию`, `addSeriesToCourse${course.idC}`)])
            for(let i of course.series){
                list.push([Markup.button.callback(`${fix.dellText} ${i.caption}`, `delSerie${course.idC}`)])
            }
            list.push([Markup.button.callback(`${flagPay}`, `statusPay${course.idC}`)]),
            list.push([Markup.button.callback(`${flagOn}`, `statusOnOff${course.idC}`)]),
            list.push([Markup.button.callback(`Удалить`, `dellCourse${course.idC}`)]),
            list.push([Markup.button.callback(`Назад`, `meinMenu`)])
            return Markup.inlineKeyboard(list)
        }
        else{
           return Markup.inlineKeyboard([
            [Markup.button.callback(`Добавить серию`, `addSeriesToCourse${course.idC}`)],
            [Markup.button.callback(`${flagPay}`, `statusPay${course.idC}`)],
            [Markup.button.callback(`${flagOn}`, `statusOnOff${course.idC}`)],
            [Markup.button.callback(`Удалить`, `dellCourse${course.idC}`)],
            [Markup.button.callback(`Назад`, `meinMenu`)]
        ]) 
        }

        
    }
}

const mark = {
    listCoursesForAdmin: async function (allCourses){
        console.log(allCourses)
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
            list.push([Markup.button.callback(`${flagOn}` + `${flagPay} ` + i.courseName, `courseSettings${i.idC}`)])
        }
        // list.push([Markup.button.callback(`${fix.courses}`, 'ggg')])
        return list
    },
    uploadCoursesFromMongo: async function (){
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