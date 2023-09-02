const mongoose = require('mongoose')
const { Telegraf, Markup } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const BD = require('./models/post')
const { fix } = require('./const')
const { keys } = require('./keyboards.js')
const { User, Course } = require('./class.js')

func = {

    dbConnect: async function (){
        mongoose
        .set("strictQuery", false)
        .connect(process.env.BD_TOKEN, {useNewUrlParser: true})
        .then((res) => console.log(`connect to DB "${fix.bdNmame}" ${process.env.MONGO_COLLECTION}`))
        .catch((error) => console.log(error))
    },
    dataBazaCreate: async function (){
        try{
          await BD.updateOne({baza: 'dataBaze'}, {$inc: {perezapuskJs: 1}}, {upsert: true})  
        }
        catch(e){
            console.log(e)
        } 
    },
    getInfoFromMongo: async function (id){
        try{
          return await BD.findOne({id: id})   
        }
        catch(e){
            console.log(e)
        }   
    },
    getAllUsersFromMongo: async function (){
        try{
            return await BD.find({id: {$exists: true}})
        }
        catch(e){
            console.log(e)
        }  
    },
    userClass: async function (array, userId){
        try{
          return array.find(item => item.id == userId)   
        }
        catch(e){
            console.log(e)
        }
    },
    updateArray: async function (arrayAllUsers){
        try{
            arrayAllUsers = []
            for(let i of await func.getAllUsersFromMongo()){
                arrayAllUsers.push(new User(i))
            }
            return arrayAllUsers 
        }
        catch(e){
            console.log(e)
        }
    },
    addNewUserToArray: async function (ctx, arrayAllUsers, currentId){
        try{
           if(!arrayAllUsers.map(item => item.id).includes(currentId)){
            await BD.updateOne({id: currentId}, {username: '@' + ctx.from.username, lastActiv: Date.now(), point: 0}, {upsert: true})
            arrayAllUsers.push(new User(await func.getInfoFromMongo(currentId)))
            await bot.telegram.sendMessage(process.env.TECH_SCREEN, 'New user! 👑\n' + '@' + ctx.from.username)
            }
            return arrayAllUsers 
        }
        catch(e){
            console.log(e)
        } 
    },
    saveLogo: async function (ctx){
        try{
          await BD.updateOne({baza: 'dataBaze'}, {logo: {'type': 'photo', 'media': ctx.message.photo[0].file_id}})  
        }
        catch(e){
            console.log(e)
        }
    },
    saveVideo: async function (ctx){
        try{
          console.log(ctx.message)
          await BD.updateOne({baza: 'dataBaze'}, {video: {'type': 'video', 'media': ctx.message.video.file_id, 'caption': ctx.message.video.file_name}})  
        }
        catch(e){
            console.log(e)
        }  
    },
    startStep: async function (ctx, arrayAllUsers){
        try{
            await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
            arrayAllUsers = await func.addNewUserToArray(ctx, arrayAllUsers, ctx.from.id)
            return arrayAllUsers
        }
        catch(e){
            console.log(e)
        }
    },
    startStep1: async function (ctx, arrayAllUsers){
        try{
            arrayAllUsers = await func.addNewUserToArray(ctx, arrayAllUsers, ctx.from.id)
            return arrayAllUsers
        }
        catch(e){
            console.log(e)
        }
    },
    startMenu: async function (ctx, arrayAllUsers, logo){
        try{
            const user = await func.userClass(arrayAllUsers, ctx.from.id)
            await user.setOptionUser('step', 'zero')
            await user.setOptionUser('point', 1)
            const mediaMassiv = []
            mediaMassiv.push(logo)
    
            let keyboard
            let text

            let adminUsers = [...new Set(fix.admins.concat((await BD.findOne({baza: 'dataBaze'}, {_id: 0, admins: 1})).admins).filter(item => item !== undefined))]

            if(adminUsers.includes(ctx.from.id)){
                console.log('Admin')
                text = `<b>⚙️ ${fix.toAdminText}</b>` + '\n' + `▪️ Всего курсов: ${allCourses.length}` + '\n' + `▪️ Платных курсов: ${allCourses.filter(item => item.payStatus == true).length}`+ '\n' + `▪️ Бесплатных курсов: ${allCourses.filter(item => item.payStatus == false).length}` + '\n' + `▪️ Включенных курсов: ${allCourses.filter(item => item.statusOn == true).length}`
                keyboard = await keys.forAdminUser()
                await user.payOnOff(true)
                await user.subOnOff(true)
            }
            else if(await user.getPayStatus() == true){
                console.log('Pay')
                text = fix.allAcText
                keyboard = await keys.forPayUser()
            }
            else if(await user.getSubStatus() == true){
                console.log('Sub')
                text = fix.forAllCoursesText
                if(await user.statusPayAfterScreen == false){
                    text = fix.controlPay
                }
                else if(await user.statusPayAfterScreen == true){
                    text = fix.errorAc
                }
                keyboard = await keys.forSubUser()
            }
            else{
                console.log('Simple')
                text = fix.toSubText1
                if(await user.statusPayAfterScreen == false){
                    text = fix.controlPay
                }
                else if(await user.statusPayAfterScreen == true){
                    text = fix.errorAc
                }
                keyboard = await keys.forSimpleUser()
            }

            if(user.start == undefined){
                await user.setOptionUser('start', 0)
            }
            else{
                const a = user.start + 1
                await user.setOptionUser('start', a)
            }

            if(await user.lastText == undefined || user.start > 2){
                if(user.start > 2){
                    await bot.telegram.deleteMessage(user.id, user.lastMedia).catch(fix.errorDone)
                    await bot.telegram.deleteMessage(user.id, user.lastText).catch(fix.errorDone)
                }
                const mesMedia = await bot.telegram.sendMediaGroup(ctx.from.id, mediaMassiv, {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                const mesText = await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                console.log(mesText)
                await user.setOptionUser('lastText', mesText.message_id)
                await user.setOptionUser('lastMedia', mesMedia[0].message_id)
                await user.setOptionUser('start', 0)
            }
            else{
                await bot.telegram.editMessageMedia(ctx.from.id, await user.lastMedia, 'hh', mediaMassiv[0], {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await bot.telegram.editMessageText(ctx.from.id, await user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
        }
        catch(e){
            console.log(e)
        }
    },
    uploadCoursesFromMongo: async function (){
        try{
          return (await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses   
        }
        catch(e){
            console.log(e)
        }
    },
    classCourses: async function (coursesAr){
        try{
            allCourses = []
            for(let i of coursesAr){
                allCourses.push(new Course(i))
            }
            return allCourses
        }
        catch(e){
            console.log(e)
        }
    },
    upDateAllUsersMenu: async function (ctx, arrayAllUsers, logo, adminUsers){
        const time = Date.now()
        for(let i of arrayAllUsers.filter(item => item.id !== ctx.from.id && item.point == 1)){
               ctx.from.id = i.id
               await func.startMenu(ctx, arrayAllUsers, logo)
        }
        console.log((Date.now() - time)/1000)
        const mesText = await bot.telegram.sendMessage(ctx.chat.id, '✅', {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        setInterval(async () => {
            await bot.telegram.deleteMessage(ctx.chat.id, mesText.message_id).catch(fix.errorDone)
        }, 1500)
    },
    screen: async function (ctx, arrayAllUsers, logo){
        const user  = await func.userClass(arrayAllUsers, ctx.from.id)
        let text = `${fix.payMoment}`
        let keyboard = Markup.inlineKeyboard([
            [Markup.button.callback(`${fix.openAc}`, `openAc${ctx.from.id}`), Markup.button.callback(`${fix.errorAc}`, `errorAc${ctx.from.id}`)]
        ])
        await bot.telegram.sendMediaGroup(process.env.TECH_SCREEN, [{'type': 'photo', 'media': ctx.message.photo[0].file_id, caption: text}], {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        const m = await bot.telegram.sendMessage(process.env.TECH_SCREEN, fix.chooseVariant + ' @' + ctx.from.username, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        await user.setOptionUser('techMes', m.message_id)
        await user.setOptionUser('statusPayAfterScreen', false)
        await func.startMenu(ctx, arrayAllUsers, logo)
    }
}

exports.func = func