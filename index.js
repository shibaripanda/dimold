require('dotenv').config()
const { Telegraf, Markup  } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}
const { func } = require('./func')
const { fix } = require('./const')
const { regX } = require('./regX')
const { keys } = require('./keyboards.js')
const BD = require('./models/post')

let arrayAllUsersTemp
let allCoursesTemp
let adminUsersTemp
let logoTemp

let arrayAllUsers = []
let logo
let adminUsers
let allCourses
let n = 0

async function startWork(time){
    try{
        await func.dbConnect()
        await func.dataBazaCreate()

        allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
        adminUsers = [...new Set(fix.admins.concat((await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1})).admins).filter(item => item !== undefined))]
        logo = (await BD.findOne({baza: 'dataBaze'}, {logo: 1, _id: 0})).logo
        logo.caption = fix.helloText
        arrayAllUsers = await func.updateArray(arrayAllUsers)
        console.log('Start: ' + n + ' Users: '  + arrayAllUsers.length + ' Courses: ' + allCourses.length + ' Admins: ' + adminUsers.length)

        setInterval(async () => {
            n++

            arrayAllUsersTemp = await func.updateArray(arrayAllUsers)
            arrayAllUsers = arrayAllUsersTemp

            allCoursesTemp = await func.classCourses(await func.uploadCoursesFromMongo())
            allCourses = allCoursesTemp
            
            adminUsersTemp = [...new Set(fix.admins.concat((await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1})).admins).filter(item => item !== undefined))]
            adminUsers = adminUsersTemp
            
            logoTemp = (await BD.findOne({baza: 'dataBaze'}, {logo: 1, _id: 0})).logo
            logo = logoTemp
            logo.caption = fix.helloText

            console.log('Pulse: ' + n + ' Users: ' + arrayAllUsers.length + ' Courses: ' + allCourses.length + ' Admins: ' + adminUsers.length)
        }, time)
    }
    catch(e){
        console.log(e)
    }
}

startWork(fix.timeToUpdate)

bot.start(async (ctx) => {
    try{
        if(ctx.chat.id > 0){
            if(!arrayAllUsers.map(item => item.id).includes(ctx.from.id)){
                await bot.telegram.sendMessage(process.env.TECH_SCREEN, 'New user! 👑\n' + '@' + ctx.from.username)
            }
           arrayAllUsers = await func.startStep(ctx, arrayAllUsers)
           await func.startMenu(ctx, arrayAllUsers, logo) 
        }
    }
    catch(e){
        await func.startMenu(ctx, arrayAllUsers, logo)
        console.log(e)
    }
})

bot.on('chat_member', async (ctx) => {
    try{
        // console.log(ctx.update.chat_member.chat.id)
        arrayAllUsers = await func.startStep1(ctx, arrayAllUsers)
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        if (ctx.from.is_bot == false){
            if(ctx.update.chat_member.new_chat_member.status == 'member'){
                console.log('add')
                if(ctx.update.chat_member.chat.id == process.env.TECH_CHAT){
                   allCourses = await user.subOnOff(true) 
                }
                else if(ctx.update.chat_member.chat.id == process.env.PUBLIC_GROUP){
                    allCourses = await user.subGroupOnOff(true) 
                }
            }
            else if(ctx.update.chat_member.new_chat_member.status == 'left'){
                console.log('left')
                if(ctx.update.chat_member.chat.id == process.env.TECH_CHAT){
                   allCourses = await user.subOnOff(false)
                }
                else if(ctx.update.chat_member.chat.id == process.env.PUBLIC_GROUP){
                   allCourses = await user.subGroupOnOff(false)
                }
            }
        }
        else{
            await bot.telegram.banChatMember(ctx.chat.id, ctx.from.id, false, true)
        }
        if(await user.getPayStatus() == false && user.lastText !== undefined){
            await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
        }
    }
    catch(e){
        console.log(e)
    }
})

bot.on('message', async (ctx) => {
    try{
        if(ctx.chat.id > 0){
            // console.log(ctx.message)
            const value = ctx.message.text
            const user  = await func.userClass(arrayAllUsers, ctx.from.id)
            await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)

            if(typeof ctx.message['photo'] !== "undefined" && fix.admins.includes(ctx.from.id) && !regX.newSerie.test(user.step)){
                await func.saveLogo(ctx)
            }
            else if(typeof ctx.message['photo'] !== "undefined" && user.step == 'upScreen'){
                await func.screen(ctx, arrayAllUsers, logo)
            }
            else if(regX.adminTest.test(ctx.message.text) && fix.admins.includes(ctx.from.id)){
                const newAdmin = ctx.message.text.slice(7)
                const idNewAdmin = await BD.findOne({username: newAdmin}, {_id: 0, id: 1})
                console.log(idNewAdmin)
                if(idNewAdmin !== null){
                    await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {admins: idNewAdmin.id}})
                    adminUsers = [...new Set(fix.admins.concat(await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1}).admins).filter(item => item !== undefined))]
                    ctx.from.id = idNewAdmin.id
                    await func.startMenu(ctx, arrayAllUsers, logo) 
                }
            }
            else if(regX.adminTest1.test(ctx.message.text) && fix.admins.includes(ctx.from.id)){
                const newAdmin = ctx.message.text.slice(8)
                const idNewAdmin = await BD.findOne({username: newAdmin}, {_id: 0, id: 1})
                if(idNewAdmin !== null){
                    await BD.updateOne({baza: 'dataBaze'}, {$pull: {admins: idNewAdmin.id}})
                    adminUsers = [...new Set(fix.admins.concat(await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1}).admins).filter(item => item !== undefined))]
                    ctx.from.id = idNewAdmin.id
                    await func.startMenu(ctx, arrayAllUsers, logo)
                }
            }   
            else if(typeof ctx.message['video'] !== "undefined" && fix.admins.concat(adminUsers).includes(ctx.from.id) && regX.newSerie.test(user.step)){
                const idCourse = user.step.slice(8)
                const course = await allCourses.filter(item => item.idC == idCourse)[0]
                await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
                const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
                await course.addSeries('video', allCourses, ctx.message.video.file_id, ctx.message.caption ? ctx.message.caption: ctx.message.video.file_name.slice(0, -4), idC)
                text = `<b>${fix.settingsText}</b>\n` + course.courseName
                keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await user.setOptionUser('step', `zero`)
            }
            else if(typeof ctx.message['photo'] !== "undefined" && fix.admins.concat(adminUsers).includes(ctx.from.id) && regX.newSerie.test(user.step)){
                const idCourse = user.step.slice(8)
                const course = await allCourses.filter(item => item.idC == idCourse)[0]
                await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
                const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
                await course.addSeries('photo', allCourses, ctx.message.photo[0].file_id, ctx.message.caption ? ctx.message.caption: 'Изображение', idC)
                text = `<b>${fix.settingsText}</b>\n` + course.courseName
                keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await user.setOptionUser('step', `zero`)
            }
            else if(typeof ctx.message['document'] !== "undefined" && fix.admins.concat(adminUsers).includes(ctx.from.id) && regX.newSerie.test(user.step)){
                const idCourse = user.step.slice(8)
                const course = await allCourses.filter(item => item.idC == idCourse)[0]
                await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
                const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
                await course.addSeries('document', allCourses, ctx.message.document.file_id, ctx.message.caption ? ctx.message.caption : ctx.message.document.file_name.slice(0, -4), idC)
                text = `<b>${fix.settingsText}</b>\n` + course.courseName
                keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await user.setOptionUser('step', `zero`)
            }
            else if(user.step == 'newCourse'){
                await BD.updateOne({baza: 'dataBaze'}, {$inc: {idC: 1}}, {upsert: true})
                const idC = (await BD.findOne({baza: 'dataBaze'}, {_id: 0, idC: 1})).idC
                await BD.updateOne({baza: 'dataBaze'}, {$addToSet: {courses: {idC: idC, courseName: value, courseLike: [], series: [], payStatus: true, statusOn: false, start: Date.now()}}})
                allCourses = await func.classCourses(await func.uploadCoursesFromMongo())
                await user.setOptionUser('step', 'zero')
                await func.startMenu(ctx, arrayAllUsers, logo)
            }
            else if(user.step == 'order'){
                // console.log(ctx.from)
                await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
                await bot.telegram.sendMessage(process.env.TECH_SCREEN, value + '\n' + ctx.from.first_name  + '\n@' + ctx.from.username).catch(fix.errorDone)
                await user.setOptionUser('step', 'zero')
                await func.startMenu(ctx, arrayAllUsers, logo)
            }
            else if(regX.total.test(ctx.message.text.toLowerCase()) && fix.admins.includes(ctx.from.id)){
                const totalUsers = await BD.countDocuments()
                const mes = await bot.telegram.sendMessage(ctx.chat.id, 'Пользователей: ' + totalUsers).catch(fix.errorDone)
                setTimeout(async () => {
                    bot.telegram.deleteMessage(ctx.chat.id, mes.message_id).catch(fix.errorDone)
                }, 1500)
            }
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
            let value = await ctx.update.callback_query.data
            // console.log(value)
            let user  = await func.userClass(arrayAllUsers, ctx.from.id)
            let text
            let keyboard = false
        if(ctx.chat.id > 0){
            if(value == 'adCourse'){
                await user.setOptionUser('step', 'newCourse')
                console.log(await user.step)
                text = `<b>${fix.addNameText}</b>\n`
                keyboard =  Markup.inlineKeyboard([
                    [Markup.button.callback(`${fix.canselText}`, 'meinMenu')]
                ])
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.courseSettings.test(value)){
                const valueSplit = value.slice(14)
                const course = await allCourses.filter(item => item.idC == valueSplit)[0]
                // console.log(course)
                let maxSer = ''
                if(course.series.length > 83){
                    maxSer = 'Максимальное количество серий ❗️❗️❗️'
                }
                text = `<b>${fix.settingsText}</b>\n` + `"${course.courseName}"\n` + `${fix.countSeries} ${course.series.length}\n${maxSer}`
                keyboard = await keys.forEditCourse(course)
                // console.log(keyboard.reply_markup.inline_keyboard.length)
                const test = await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                // console.log(test)
            }
            else if(regX.dellCourse.test(value)){
                const valueSplit = value.slice(10)
                const course = await allCourses.filter(item => item.idC == valueSplit)[0]
                await course.dell(allCourses)
                await func.startMenu(ctx, arrayAllUsers, logo)
                // await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
            }
            else if(regX.statusOnOff.test(value)){
                console.log(value)
                const valueSplit = value.slice(11)
                const course = await allCourses.filter(item => item.idC == valueSplit)[0]
                await course.onOff(allCourses)
                text = `<b>${fix.settingsText}</b>\n` + course.courseName
                keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                // await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers) 3
            }
            else if(regX.orderCourse.test(value)){
                console.log(value)
                // const valueSplit = value.slice(11)
                // const course = await allCourses.filter(item => item.idC == valueSplit)[0]
                // await course.onOff(allCourses)
                await user.setOptionUser('step', 'order')
                text = fix.orderCourseTitle
                keyboard = false
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.statusPay.test(value)){
                const valueSplit = value.slice(9)
                const course = await allCourses.filter(item => item.idC == valueSplit)[0]
                await course.pay(allCourses)
                text = `<b>${fix.settingsText}</b>\n` + course.courseName
                keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                // await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers) 3
            }
            else if(value == 'meinMenu'){
                await func.startMenu(ctx, arrayAllUsers, logo, allCourses)
            }
            else if(regX.addSeriesToCourse.test(value)){
                const valueSplit = value.slice(17)
                const name = allCourses.filter(item => item.idC == valueSplit)[0].courseName
                await user.setOptionUser('step', `newSerie${valueSplit}`)
                text = `<b>${fix.addSerieToBot}</b>\n"${name}"`
                keyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(`${fix.canselText}`, 'meinMenu')]
                ])
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.look.test(value)){
                    const valueSplit = value.slice(4)
                    const name = allCourses.filter(item => item.idC == valueSplit)[0]
                if(name.statusOn == true){
                    await user.setOptionUser('point', 2) 
                    text = `${fix.reitingText}(${name.courseLike.length}) ` + `"${name.courseName}"`
                    keyboard = await keys.forLookCourse(name, await user.getPayStatus())
                    await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                }
                else{
                    await user.setOptionUser('step', 'zero')
                    await func.startMenu(ctx, arrayAllUsers, logo)
                }
            }
            else if(regX.showSer.test(value)){
                const valueSplit = value.slice(7)
                const course = await allCourses.find(item => item.series.find(item => item.idC == valueSplit))
                if(course.statusOn == true){
                    await user.setOptionUser('point', 3)
                    const serie = course.series.find(item => item.idC == valueSplit)
                    // console.log(serie)
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
                        if(await user.getPayStatus() == false && indexSerie > fix.freeModules - 2 && course.payStatus == true){
                            but2 = Markup.button.callback(`${fix.buyText}`, 'buyAllCourses')
                        }
                        else{
                        but2 = Markup.button.callback(`${fix.nextText}`, `showSer${course.series[indexSerie + 1].idC}`)  
                        }
                    }
                    else{
                        but2 = Markup.button.callback(`${fix.nextText}`, `showSer`, 'hide')  
                    }

                    keyboard = Markup.inlineKeyboard([
                        [Markup.button.callback(`👍`, `likeCourse${course.idC}`)],
                        [but1, Markup.button.callback(`${fix.listSwries}`, `look${course.idC}`), but2],
                        [Markup.button.callback(`${fix.listCourse}`, 'meinMenu')]
                    ])
                    await bot.telegram.editMessageMedia(ctx.chat.id, await user.lastMedia, 'hh', serie, {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                    await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                }
                else{
                    await user.setOptionUser('step', 'zero')
                    await func.startMenu(ctx, arrayAllUsers, logo)
                }
            }
            else if(regX.likeCourse.test(value)){
                const valueSplit = value.slice(10)
                const name = allCourses.filter(item => item.idC == valueSplit)[0]
                await name.like(allCourses, ctx)
                // await func.upDateAllUsersMenu(ctx, arrayAllUsers, logo, adminUsers)
                // text = `"${name.courseName}"`
                // keyboard = await keys.forLookCourse(name)
                // await bot.telegram.editMessageText(ctx.chat.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.buyAllCourses.test(value)){
                await user.setOptionUser('point', 4)
                text = `${fix.forPayStepText}`

                keyboard = Markup.inlineKeyboard([
                    [Markup.button.webApp(`${fix.payStep1} ${fix.linklPayName}`, fix.buyLink), Markup.button.webApp(`${fix.payStep1} ${fix.linklPayName1}`, fix.buyLink1)],
                    // [Markup.button.webApp(`${fix.payStep1} ${fix.linklPayName2}`, fix.buyLink2)],
                    [Markup.button.callback(`${fix.payStep2} ${fix.upLoadScreen}`, 'upLoadScreen')],
                    [Markup.button.callback(`${fix.backText}`, 'meinMenu')]
                ])
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: false, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.upLoadScreen.test(value)){
                text = `${fix.upLoadScreenText}`
                await user.setOptionUser('step', 'upScreen')
                keyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(`${fix.backText}`, 'meinMenu')]
                ])
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }            
            else if(regX.delSerie.test(value)){
                await user.setOptionUser('point', 3)
                const valueSplit = await value.slice(8)
                const course = await allCourses.find(item => item.series.find(item => item.idC == valueSplit))
                await course.delSerie(allCourses, valueSplit)
                text = `<b>${fix.settingsText}</b>\n` + `"${course.courseName}"\n` + `${fix.countSeries} ${course.series.length}`
                const keyboard = await keys.forEditCourse(course)
                await bot.telegram.editMessageText(ctx.chat.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else{
                console.log('nihua')
            }
        }
        else{
            if(regX.openAc.test(value)){
                value = Number(value.slice(6))
                user = await func.userClass(arrayAllUsers, value)
                await user.payOnOff(true)
                ctx.from.id = value
                await func.startMenu(ctx, arrayAllUsers, logo)
                text = fix.buyer + ' ' + await user.username + '\n' + fix.ok + '\n' + fix.adminDone + ' ' + '@' + ctx.from.username
                keyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(`✔️${fix.openAc}`, `openAc${ctx.from.id}`), Markup.button.callback(`${fix.errorAc}`, `errorAc${ctx.from.id}`)]
                ])
                await bot.telegram.editMessageText(process.env.TECH_SCREEN, await user.techMes, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else if(regX.errorAc.test(value)){
                value = Number(value.slice(7))
                user = await func.userClass(arrayAllUsers, value)
                await user.payOnOff(false)
                await user.setOptionUser('statusPayAfterScreen', true)
                ctx.from.id = value
                await func.startMenu(ctx, arrayAllUsers, logo)
                text = fix.buyer + ' ' + await user.username + '\n' + fix.no + '\n' + fix.adminDone + ' ' + '@' + ctx.from.username
                keyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(`${fix.openAc}`, `openAc${ctx.from.id}`), Markup.button.callback(`❌${fix.errorAc}`, `errorAc${ctx.from.id}`)]
                ])
                await bot.telegram.editMessageText(process.env.TECH_SCREEN, await user.techMes, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else{
                console.log('nihua1')
            }
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