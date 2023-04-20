require('dotenv').config()
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post']}
const { func } = require('./func')
const { fix } = require('./const')
const { regX } = require('./regX')
const { keys } = require('./keyboards.js')
const BD = require('./models/post')

let arrayAllUsers = []
let logo
let adminUsers
let allCourses
let n = 0

async function startWork(){
    await func.dbConnect()
    await func.dataBazaCreate()

    allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
    adminUsers = [...new Set(fix.admins.concat(await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1}).admins).filter(item => item !== undefined))]
    logo = (await BD.findOne({baza: 'dataBaze'}, {logo: 1, _id: 0})).logo
    logo.caption = fix.helloText
    arrayAllUsers = await func.updateArray(arrayAllUsers)
    console.log('Start: ' + n + ' Users: '  + arrayAllUsers.length + ' Courses: ' + allCourses.length + ' Admins: ' + adminUsers.length)

    setInterval(async () => {
        n++

        arrayAllUsers =  await func.updateArray(arrayAllUsers)

        allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
        
        adminUsers = [...new Set(fix.admins.concat(await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1}).admins).filter(item => item !== undefined))]
        
        logo = (await BD.findOne({baza: 'dataBaze'}, {logo: 1, _id: 0})).logo
        logo.caption = fix.helloText

        console.log('Pulse: ' + n + ' Users: ' + arrayAllUsers.length + ' Courses: ' + allCourses.length + ' Admins: ' + adminUsers.length)
    }, 10000)
}

startWork()

bot.start(async (ctx) => {
    try{
        arrayAllUsers = await func.startStep(ctx, arrayAllUsers)
        await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
    }
    catch(e){
        console.log(e)
    }
})

bot.on('message', async (ctx) => {
    try{
        const value = ctx.message.text
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        console.log(user)
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)

        if(typeof ctx.message['photo'] !== "undefined" && fix.admins.includes(ctx.from.id)){
            await func.saveLogo(ctx)
        }
        // else if(typeof ctx.message['video'] !== "undefined" && fix.admins.includes(ctx.from.id)){
        //     await func.saveLogo(ctx)
        // }
        else if(typeof ctx.message['video'] !== "undefined" && fix.admins.includes(ctx.from.id) && regX.newSerie.test(user.step)){
            const idCourse = user.step.slice(8)
            console.log(idCourse)
            console.log(user.step)
            const course = allCourses.filter(item => item.idC == idCourse)[0]
            await course.addSeries(allCourses, ctx.message.video.file_id, ctx.message.video.file_name)
            text = `<b>${fix.settingsText}</b>\n` + course.courseName
            keyboard = await keys.forEditCourse(course)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(user.step == 'newCourse'){
            console.log('adcourse')
            await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
            const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
            await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {courses: {idC: idC, courseName: value, courseLike: [], series: [], payStatus: true, statusOn: false}}})
            allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
            user.setOptionUser('step', 'zero')
            await func.startMenu(ctx, arrayAllUsers, logo)
        }
    }
    catch(e){
        console.log(e)
    }   
})

bot.on('callback_query', async (ctx) => {
    await ctx.answerCbQuery()
    const value = ctx.update.callback_query.data
    const user  = await func.userClass(arrayAllUsers, ctx.from.id)
    let text
    let keyboard = false
    if(value == 'adCourse'){
        user.setOptionUser('step', 'newCourse')
        console.log(user.step)
        text = `<b>${fix.addNameText}</b>\n`
        keyboard = false
        await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    else if(regX.courseSettings.test(value)){
        console.log(value)
        const valueSplit = value.slice(14)
        const course = allCourses.filter(item => item.idC == valueSplit)[0]
        console.log(course)
        text = `<b>${fix.settingsText}</b>\n` + course.courseName
        keyboard = await keys.forEditCourse(course)
        await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    else if(regX.dellCourse.test(value)){
        console.log(value)
        const valueSplit = value.slice(10)
        const course = allCourses.filter(item => item.idC == valueSplit)[0]
        console.log(allCourses.length)
        await course.dell(allCourses)
        console.log(allCourses.length)
        await func.startMenu(ctx, arrayAllUsers, logo)
    }
    else if(regX.statusOnOff.test(value)){
        console.log(value)
        const valueSplit = value.slice(11)
        const course = allCourses.filter(item => item.idC == valueSplit)[0]
        await course.onOff(allCourses)
        text = `<b>${fix.settingsText}</b>\n` + course.courseName
        keyboard = await keys.forEditCourse(course)
        await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    else if(regX.statusPay.test(value)){
        console.log(value)
        const valueSplit = value.slice(9)
        const course = allCourses.filter(item => item.idC == valueSplit)[0]
        await course.pay(allCourses)
        text = `<b>${fix.settingsText}</b>\n` + course.courseName
        keyboard = await keys.forEditCourse(course)
        await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    else if(value == 'meinMenu'){
        await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
    }
    else if(regX.addSeriesToCourse.test(value)){
        const valueSplit = value.slice(17)
        user.setOptionUser('step', `newSerie${valueSplit}`)
        text = `<b>${fix.addSerieToBot}</b>\n`
        keyboard = false
        await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    
})


bot.launch(option)
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))