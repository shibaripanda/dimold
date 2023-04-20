const BD = require("./models/post")

const fix = {
   bdNmame: 'DimaCourse',
   admins: [599773731],
   techChat: process.env.TECH_CHAT,
   errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
   helloText: 'Привет, у нас для тебя много интересной информации!',
   mainMenuText: 'Главное меню',
   toSubText: 'Для доступа подпишись!',
   channelName: 'Канал',
   addCourse: 'Добавить курс',
   courses: 'Курсы',
   toAdminText: 'Admin mode',
   settingsText: 'Настройки',
   addNameText: 'Название курса?',
   addSerieToBot: 'Че лыбишься? Отправь серию боту',
   dellText: 'Удалить',
   backText: 'Назад',
   addSerie: 'Добавить серию',
   payText: 'Платный',
   notPayText: 'Бесплатный',
   vkl: 'Вкл',
   vikl: 'Выкл',
   canselText: 'Отмена',
   countSeries: 'Количество серий:',
   forAllCoursesText: 'Для доступа ко всем курсам купите доступ',
   buyText: 'Купить доступ',
   buyLink: 'google.com',
   linkSub: 'google.com',
   allAcText: 'Вам доступны все курсы!'
} 

exports.fix = fix