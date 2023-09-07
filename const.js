const BD = require("./models/post")

const fix = {
   pic: '🖼',
   vid: '🎥',
   doc: '💾',
   bdNmame: 'DimaCourse',
   admins: [599773731, 6169010819],
   techChat: process.env.TECH_CHAT,
   errorDone: function(error){if(error.response && error.response.statusCode === 400 || error.response && error.response.statusCode === 403){}},
   helloText: 'С Вами команда Focused ✅\nНаша миссия вывести твою жизнь на новый уровень! 🚀',
   mainMenuText: 'Главное меню',
   toSubText: 'Для доступа подпишись!',
   toSubText1: 'Для доступа подпишись! Если вы уже подписаны, то вам необходимо отменить подписку (выйти из канала) и подписаться заново! Бот увидит вас и откроет доступ к бесплатным курсам!',
   channelName: 'Канал',
   addCourse: 'Добавить курс',
   courses: 'Курсы',
   toAdminText: 'Admin mode',
   settingsText: 'Настройки',
   addNameText: 'Название курса?',
   addSerieToBot: 'Че лыбишься? Отправь серию боту (фото, видео или файл)\nВидео и файл: название будет как у оригинала если не указать новое при отправке (при получении файла пользователь увидит оригинальное название файла)\nФото: Название будет: "Изображение", если не указать другое при отправке\n',
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
   buyLink: process.env.buyLink,
   buyLink1: process.env.buyLink1,
   buyLink2: process.env.buyLink2,
   linkSub: process.env. linkSub,
   linkSubGroup: process.env.linkSubGroup,
   linkOtziviGroup: process.env.linkOtziviGroup,
   maind: 'Обсуждение',
   otzivi: 'Отзывы',
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
   linklPayName: 'Тинькофф 2000р',
   linklPayName1: 'Qiwi 2000р',
   linklPayName2: 'Binance 2000р',
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