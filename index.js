require('dotenv').config()
const { Telegraf, Markup  } = require('telegraf')
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
    try{
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
    catch(e){
        console.log(e)
    }
}

startWork()

bot.start(async (ctx) => {
    try{
        arrayAllUsers = await func.startStep(ctx, arrayAllUsers)
        await func.startMenu(ctx, arrayAllUsers, logo)
    }
    catch(e){
        await func.startMenu(ctx, arrayAllUsers, logo)
        console.log(e)
    }
})

bot.on('chat_member', async (ctx) => {
    try{
        console.log(ctx.from.id)
        console.log(ctx.update.chat_member)
        console.log(ctx.from.id)
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        if (ctx.from.is_bot == false && ctx.update.chat_member.chat.id == process.env.TECH_CHAT){
            if(ctx.update.chat_member.new_chat_member.status == 'member'){
                console.log('add')
                allCourses = await user.subOnOff(true)
            }
            else if(ctx.update.chat_member.new_chat_member.status == 'left'){
                console.log('left')
                allCourses = await user.subOnOff(false)
            }
        }
        else{
            ctx.telegram.banChatMember(ctx.chat.id, ctx.from.id, false, true)
        }
        if(await user.getPayStatus() == false){
            await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
        }
    }
    catch(e){
        console.log(e)
    }
})

bot.on('message', async (ctx) => {
    try{
        const value = ctx.message.text
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)

        if(typeof ctx.message['photo'] !== "undefined" && fix.admins.includes(ctx.from.id)){
            await func.saveLogo(ctx)
        }
        // else if(typeof ctx.message['video'] !== "undefined" && fix.admins.includes(ctx.from.id)){
        //     await func.saveLogo(ctx)
        // }
        else if(typeof ctx.message['video'] !== "undefined" && fix.admins.includes(ctx.from.id) && regX.newSerie.test(user.step)){
            const idCourse = user.step.slice(8)
            const course = allCourses.filter(item => item.idC == idCourse)[0]
            await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
            const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
            await course.addSeries(allCourses, ctx.message.video.file_id, ctx.message.video.file_name, idC)
            text = `<b>${fix.settingsText}</b>\n` + course.courseName
            keyboard = await keys.forEditCourse(course)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            user.setOptionUser('step', `zero`)
        }
        else if(user.step == 'newCourse'){
            await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
            const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
            await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {courses: {idC: idC, courseName: value, courseLike: [], series: [], payStatus: true, statusOn: false, start: Date.now()}}})
            allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
            user.setOptionUser('step', 'zero')
            await func.startMenu(ctx, arrayAllUsers, logo)
        }
    }
    catch(e){
        await func.startMenu(ctx, arrayAllUsers, logo)
        console.log(e)
    }   
})

bot.on('callback_query', async (ctx) => {
    try{
        await ctx.answerCbQuery()
        const value = ctx.update.callback_query.data
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        let text
        let keyboard = false
        if(value == 'adCourse'){
            user.setOptionUser('step', 'newCourse')
            console.log(user.step)
            text = `<b>${fix.addNameText}</b>\n`
            keyboard =  Markup.inlineKeyboard([
                [Markup.button.callback(`${fix.canselText}`, 'meinMenu')]
            ])
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(regX.courseSettings.test(value)){
            const valueSplit = value.slice(14)
            const course = allCourses.filter(item => item.idC == valueSplit)[0]
            text = `<b>${fix.settingsText}</b>\n` + `"${course.courseName}"\n` + `${fix.countSeries} ${course.series.length}`
            keyboard = await keys.forEditCourse(course)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(regX.dellCourse.test(value)){
            const valueSplit = value.slice(10)
            const course = allCourses.filter(item => item.idC == valueSplit)[0]
            await course.dell(allCourses)
            await func.startMenu(ctx, arrayAllUsers, logo)
            await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
        }
        else if(regX.statusOnOff.test(value)){
            console.log(value)
            const valueSplit = value.slice(11)
            const course = allCourses.filter(item => item.idC == valueSplit)[0]
            await course.onOff(allCourses)
            text = `<b>${fix.settingsText}</b>\n` + course.courseName
            keyboard = await keys.forEditCourse(course)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
        }
        else if(regX.statusPay.test(value)){
            const valueSplit = value.slice(9)
            const course = allCourses.filter(item => item.idC == valueSplit)[0]
            await course.pay(allCourses)
            text = `<b>${fix.settingsText}</b>\n` + course.courseName
            keyboard = await keys.forEditCourse(course)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
        }
        else if(value == 'meinMenu'){
            await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
        }
        else if(regX.addSeriesToCourse.test(value)){
            const valueSplit = value.slice(17)
            const name = allCourses.filter(item => item.idC == valueSplit)[0].courseName
            user.setOptionUser('step', `newSerie${valueSplit}`)
            text = `<b>${fix.addSerieToBot}</b>\n"${name}"`
            keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(`${fix.canselText}`, 'meinMenu')]
            ])
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(regX.look.test(value)){
            user.setOptionUser('point', 2)
            const valueSplit = value.slice(4)
            const name = allCourses.filter(item => item.idC == valueSplit)[0]
            text = `${fix.reitingText}(${name.courseLike.length}) ` + `"${name.courseName}"`
            keyboard = await keys.forLookCourse(name)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(regX.showSer.test(value)){
            user.setOptionUser('point', 3)
            const valueSplit = value.slice(7)

            const course = allCourses.find(item => item.series.find(item => item.idC == valueSplit))
            const serie = course.series.find(item => item.idC == valueSplit)
            const indexSerie = course.series.findIndex(item => item.idC == valueSplit)

            const text = `${fix.reitingText}(${course.courseLike.length}) ` + `"${course.courseName}"`
            let but1 
            let but2

            if(indexSerie - 1 > -1){
                but1 = Markup.button.callback(`${fix.back1Text}`, `showSer${course.series[indexSerie - 1].idC}`) 
            }
            else{
                but1 = Markup.button.callback(`${fix.back1Text}`, `showSer`, 'hide') 
            }

            if(indexSerie + 1 < course.series.length){
                but2 = Markup.button.callback(`${fix.nextText}`, `showSer${course.series[indexSerie + 1].idC}`) 
            }
            else{
                but2 = Markup.button.callback(`${fix.nextText}`, `showSer`, 'hide')  
            }

            keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(`👍`, `likeCourse${course.idC}`)],
                [but1, Markup.button.callback(`${fix.listSwries}`, `look${course.idC}`), but2],
                [Markup.button.callback(`${fix.listCourse}`, 'meinMenu')]
            ])
            await bot.telegram.editMessageMedia(ctx.chat.id, user.lastMedia, 'hh', serie, {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        else if(regX.likeCourse.test(value)){
            const valueSplit = value.slice(10)
            const name = allCourses.filter(item => item.idC == valueSplit)[0]
            await name.like(allCourses, ctx)
            await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
            // text = `"${name.courseName}"`
            // keyboard = await keys.forLookCourse(name)
            // await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
    }
catch(e){
    await func.startMenu(ctx, arrayAllUsers, logo)
    console.log(e)
}
})


bot.launch(option)
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))