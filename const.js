const BD = require("./models/post")

const fix = {
   bdNmame: 'DimaCourse',
   admins: [599773731, 6169010819],
   techChat: process.env.TECH_CHAT,
   errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
   helloText: 'С Вами команда Focused✅.\nНаша миссия вывести твою жизнь на новый уровень! 🚀',
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
   buyText: 'Купить доступ!',
   buyLink: 'https://my.qiwi.com/Dmytryi-Dvtuf59S8-',
   linkSub: 'https://t.me/+mnmeiBtGRGdmYTJi',
   allAcText: 'Вам доступны все курсы!',
   listCourse: 'Список курсов',
   listSwries: 'Все серии',
   nextText: 'Следующая',
   back1Text: 'Предыдущая',
   reitingText: '📊',
   refreshText: '♻️',
   timeForNew: 604800000,
   timeToUpdate: 112500,
   newTime: '🆕✴️',
   payStep1: 'Шаг 1:',
   linklPayName: 'QIWI 2000р',
   forPayStepText: 'Несколько простых шагов для полного доступа ко всем курсам',
   payStep2: 'Шаг 2:',
   upLoadScreen: 'Отправить скрин оплаты',
   upLoadScreenText: 'Отправь боту скрин оплаты!',
   controlPay: 'Мы проверяем оплату и как можно быстрее откроем доступ для Вас!',
   payMoment: 'Контроль оплаты',
   chooseVariant: 'Выбери действие',
   openAc: 'Открыть доступ',
   errorAc: 'Ошибка оплаты',
   ok: '✔️ Одобрено!',
   no: '❌ Отклонено!',
   adminDone: 'Исполнитель:',
   buyer: 'Покупатель:'
} 

exports.fix = fix