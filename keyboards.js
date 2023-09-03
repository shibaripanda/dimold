const { Telegraf, Markup } = require('telegraf')
const { fix } = require('./const')
const BD = require('./models/post')
const { Course } = require('./class.js')

const keys = {

    forPayUser: async function () {
        try{
          return Markup.inlineKeyboard(await mark.listCoursesForPay(await mark.uploadCoursesFromMongo()))  
        }
        catch(e){
            console.log(e)
        }  
    },
    forSubUser: async function () {
        try{
          return Markup.inlineKeyboard(await mark.listCoursesForSub(await mark.uploadCoursesFromMongo()))  
        }
        catch(e){
            console.log(e)
        }    
    },
    forSimpleUser: async function () {
        try{
          return Markup.inlineKeyboard(await mark.listCoursesForSimple(await mark.uploadCoursesFromMongo()))  
        }
        catch(e){
            console.log(e)
        }
    },
    forAdminUser: async function () {
        try{
          return Markup.inlineKeyboard(await mark.listCoursesForAdmin(await mark.uploadCoursesFromMongoAdmin()))  
        }
        catch(e){
            console.log(e)
        } 
    },
    forEditCourse: async function (course) {
        try{
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
                if(flagOn == `${fix.vkl} /🔴 ${fix.vikl}` && course.series.length < 84){
                  list.push([Markup.button.callback(`${fix.addSerie}`, `addSeriesToCourse${course.idC}`)])  
                }
                for(let i of course.series){
                    let docType = fix.vid
                    if(i.type == 'photo'){
                        docType = fix.pic
                    }
                    else if(i.type == 'document'){
                        docType = fix.doc
                    }
                    if(flagOn == `${fix.vkl} /🔴 ${fix.vikl}`){
                        list.push([Markup.button.callback(`❌ ${fix.dellText}: ${docType} ${i.caption}`, `delSerie${i.idC}`)])
                    }
                    else{
                        list.push([Markup.button.callback(`${docType} ${i.caption}`, `zero`)])
                    }
                }
                list.push([Markup.button.callback(`${flagPay}`, `statusPay${course.idC}`)])
                list.push([Markup.button.callback(`${flagOn}`, `statusOnOff${course.idC}`)])
                if(flagOn == `${fix.vkl} /🔴 ${fix.vikl}`){
                   list.push([Markup.button.callback(`${fix.dellText}`, `dellCourse${course.idC}`)])
                }
                list.push([Markup.button.callback(`${fix.backText}`, `meinMenu`)])
                return Markup.inlineKeyboard(list)
            }
            else{  
            return Markup.inlineKeyboard([
                [Markup.button.callback(`${fix.addSerie}`, `addSeriesToCourse${course.idC}`)],
                [Markup.button.callback(`${fix.dellText}`, `dellCourse${course.idC}`)],
                [Markup.button.callback(`${fix.backText}`, `meinMenu`)]
            ]) 
            } 
        }
        catch(e){
            console.log(e)
        }
    },
    forLookCourse: async function (course) {
        try{
            if(course.series.length > 0){
            const list = []
            list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
            // list.push([Markup.button.callback(`👍`, `likeCourse${course.idC}`)])
            for(let i of course.series){
                let docType = fix.vid
                if(i.type == 'photo'){
                    docType = fix.pic
                }
                else if(i.type == 'document'){
                    docType = fix.doc
                }
                list.push([Markup.button.callback(`${docType} ${i.caption}`, `showSer${i.idC}`)])
            }
            list.push([Markup.button.callback(`${fix.backText}`, `meinMenu`), Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
            return Markup.inlineKeyboard(list)
          }  
        }
        catch(e){
            console.log(e)
        }
    }
}

const mark = {

    listCoursesForAdmin: async function (allCourses){
        try{
           const list = []
           if(allCourses.length < 80){
            list.push([Markup.button.callback(`${fix.addCourse}`, 'adCourse')])
           }
            for(let i of allCourses.sort(function(a, b){return b.start - a.start})){
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
                flagPay = `✅`
            }
                list.push([Markup.button.callback(`${fix.reitingText}(${i.courseLike.length}) ` + `${flagOn}` + `${flagPay} ` + `(${i.series.length})` + ' ' + i.courseName, `courseSettings${i.idC}`)])
            }
            // list.push([Markup.button.callback(`${fix.refreshText}`, 'meinMenu')])
            return list 
        }
        catch(e){
            console.log(e)
        } 
    },
    listCoursesForSimple: async function (allCourses){
        try{
           const list = []
            list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
            list.push([Markup.button.url(`${fix.toSubText}`, fix.linkSub)])
            for(let i of allCourses.filter(item => item.statusOn == true).sort(function(a, b){return b.courseLike.length - a.courseLike.length})){
                list.push([Markup.button.callback(`${fix.reitingText}(${i.courseLike.length}) ` + `🔒 ` + i.courseName, `zero`)])
            }
            list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
            return list 
        }
        catch(e){
            console.log(e)
        }
    },
    listCoursesForSub: async function (allCourses){
        try{
           const list = []
           list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
        list.push([Markup.button.callback(`${fix.buyText}`, 'buyAllCourses')])
        for(let i of allCourses.filter(item => item.statusOn == true).sort(function(a, b){return b.courseLike.length - a.courseLike.length})){
            let newTime = ''
            if(Date.now() - i.start < fix.timeForNew){
                newTime = fix.newTime
            }
            let flagPay
            let link
            if(i.payStatus == true){
                flagPay = `🔒`
                link = 'zero'
            }
            else{
                flagPay = `✅`
                link = 'look' + i.idC
            }
                list.push([Markup.button.callback(`${newTime}${fix.reitingText}(${i.courseLike.length}) ` + `${flagPay} ` + i.courseName, link)])
        }
        list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
        return list 
        }
        catch(e){
            console.log(e)
        }
    },
    listCoursesForPay: async function (allCourses){
        try{
          const list = []
          list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
        for(let i of allCourses.filter(item => item.statusOn == true).sort(function(a, b){return b.courseLike.length - a.courseLike.length})){
            let newTime = ''
            if(Date.now() - i.start < fix.timeForNew){
                newTime = fix.newTime
            }
            list.push([Markup.button.callback(`${newTime}${fix.reitingText}(${i.courseLike.length}) ` + `✅ ` + i.courseName, 'look' + i.idC)])
        }
        list.push([Markup.button.url(`${fix.maind}`, fix.linkSubGroup), Markup.button.url(`${fix.otzivi}`, fix.linkOtziviGroup)])
        // list.push([Markup.button.callback(`${fix.refreshText}`, 'meinMenu')])
        return list  
        }
        catch(e){
            console.log(e)
        }
    },
    uploadCoursesFromMongo: async function (){
        try{
          return ((await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses).filter(item => item.series.length > 0)   
        }
        catch(e){
            console.log(e)
        }
    },
    uploadCoursesFromMongoAdmin: async function (){
        try{
          return (await BD.findOne({baza: 'dataBaze'}, {_id: 0, courses: 1})).courses  
        }
        catch(e){
            console.log(e)
        }
    },
    classCourses: async function (coursesAr){
        try{
          let allCourses = []
        for(let i of coursesAr){
            allCourses.push(new Course(i))
        }
        return allCourses  
        }
        catch(e){
            console.log(e)
        }
    }
}

exports.keys = keys