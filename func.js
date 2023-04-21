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
        return await BD.findOne({id: id})  
    },
    getAllUsersFromMongo: async function (){
        return await BD.find({id: {$exists: true}})  
    },
    userClass: async function (array, userId){
        return array.find(item => item.id == userId)  
    },
    updateArray: async function (arrayAllUsers){
        arrayAllUsers = []
        for(let i of await func.getAllUsersFromMongo()){
            arrayAllUsers.push(new User(i))
        }
        return arrayAllUsers
    },
    addNewUserToArray: async function (ctx, arrayAllUsers, currentId){
        if(!arrayAllUsers.map(item => item.id).includes(currentId)){
            await BD.updateOne({id: currentId}, {username: '@' + ctx.from.username, lastActiv: Date.now()}, {upsert: true})
            arrayAllUsers.push(new User(await func.getInfoFromMongo(currentId)))
        }
        return arrayAllUsers
    },
    saveLogo: async function (ctx){
        await BD.updateOne({baza: 'dataBaze'}, {logo: {'type': 'photo', 'media': ctx.message.photo[0].file_id}})
    },
    saveVideo: async function (ctx){
        console.log(ctx.message)
        await BD.updateOne({baza: 'dataBaze'}, {video: {'type': 'video', 'media': ctx.message.video.file_id, 'caption': ctx.message.video.file_name}})
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
    startMenu: async function (ctx, arrayAllUsers, logo){
        try{
            const user  = await func.userClass(arrayAllUsers, ctx.from.id)
            user.setOptionUser('step', 'zero')
            // user.subOnOff(false)
            // user.payOnOff(false)
    
            const mediaMassiv = []
            mediaMassiv.push(logo)
    
            let keyboard
            let text

            if(fix.admins.includes(ctx.from.id)){
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
                keyboard = await keys.forSubUser()
            }
            else{
                console.log('Simple')
                text = fix.toSubText
                keyboard = await keys.forSimpleUser()
            }

            if(user.lastText == undefined){
                const mesMedia = await bot.telegram.sendMediaGroup(ctx.from.id, mediaMassiv, {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                const mesText = await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                user.setOptionUser('lastText', mesText.message_id)
                user.setOptionUser('lastMedia', mesMedia[0].message_id)
            }
            else{
                await bot.telegram.editMessageMedia(ctx.from.id, user.lastMedia, 'hh', mediaMassiv[0], {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await bot.telegram.editMessageText(ctx.from.id, user.lastText, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
        }
        catch(e){
            console.log(e)
        }
    },
    uploadCoursesFromMongo: async function (){
        return (await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses 
    },
    classCourses: async function (coursesAr){
        allCourses = []
        for(let i of coursesAr){
            allCourses.push(new Course(i))
        }
        return allCourses
    }
}

exports.func = func