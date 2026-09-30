import json
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

guides = {
    "en": {
        "wechatGuide": {
            "title": "How to Use WeChat",
            "subtitle": "WeChat is the most popular messaging app in China. Follow these steps to connect with us and get instant quotes.",
            "qrTitle": "Our WeChat QR Code",
            "qrDesc": "Scan this QR code with WeChat to add us as a contact",
            "step1": {
                "title": "Download WeChat",
                "desc": "WeChat is available for free on both iOS and Android. Download it from the App Store or Google Play."
            },
            "step2": {
                "title": "Register an Account",
                "desc": "Open WeChat and sign up with your phone number. Verification is required.",
                "tip1": "Use your real phone number for verification",
                "tip2": "Set a memorable WeChat ID for easy searching"
            },
            "step3": {
                "title": "Scan Our QR Code",
                "desc": "Open WeChat, tap the '+' icon at the top right, select 'Scan', and point your camera at our QR code above."
            },
            "step4": {
                "title": "Send a Message",
                "desc": "Once added, send us a message with your product requirements. Our team responds within 12 hours.",
                "tip": "Pro tip: Sending details about your product needs (style, quantity, target price) helps us respond faster with accurate quotes."
            },
            "whatsappTitle": "Prefer WhatsApp?",
            "whatsappDesc": "We also respond on WhatsApp for your convenience",
            "whatsappBtn": "Chat on WhatsApp",
            "contactPrompt": "Or send us an inquiry directly through our website",
            "contactBtn": "Send Inquiry"
        }
    },
    "zh": {
        "wechatGuide": {
            "title": "如何使用微信",
            "subtitle": "微信是中国最流行的通讯工具。按以下步骤添加我们的微信，获取即时报价。",
            "qrTitle": "我们的微信二维码",
            "qrDesc": "用微信扫描此二维码即可添加我们为联系人",
            "step1": {
                "title": "下载微信",
                "desc": "微信在 iOS 和 Android 上均可免费下载。从 App Store 或应用商店下载即可。"
            },
            "step2": {
                "title": "注册账号",
                "desc": "打开微信，使用手机号注册。需要验证手机号。",
                "tip1": "请使用真实手机号进行验证",
                "tip2": "设置一个好记的微信号方便搜索"
            },
            "step3": {
                "title": "扫描我们的二维码",
                "desc": "打开微信，点击右上角的「+」号，选择「扫一扫」，将摄像头对准上方的二维码。"
            },
            "step4": {
                "title": "发送消息",
                "desc": "添加成功后，发送您的产品需求。我们的团队将在12小时内回复。",
                "tip": "小提示：发送详细的产品需求（款式、数量、目标价格）能帮助我们更快给出准确报价。"
            },
            "whatsappTitle": "更习惯用 WhatsApp？",
            "whatsappDesc": "我们也支持 WhatsApp 沟通",
            "whatsappBtn": "在 WhatsApp 上聊天",
            "contactPrompt": "或者直接通过网站提交询盘",
            "contactBtn": "提交询盘"
        }
    },
    "ru": {
        "wechatGuide": {
            "title": "Как использовать WeChat",
            "subtitle": "WeChat — самое популярное приложение для общения в Китае. Выполните эти шаги, чтобы связаться с нами и получить быстрый расчёт.",
            "qrTitle": "Наш QR-код WeChat",
            "qrDesc": "Отсканируйте этот QR-код в WeChat, чтобы добавить нас в контакты",
            "step1": {
                "title": "Скачайте WeChat",
                "desc": "WeChat бесплатен для iOS и Android. Скачайте его из App Store или Google Play."
            },
            "step2": {
                "title": "Зарегистрируйте аккаунт",
                "desc": "Откройте WeChat и зарегистрируйтесь по номеру телефона. Требуется проверка.",
                "tip1": "Используйте реальный номер телефона для проверки",
                "tip2": "Установите запоминающийся WeChat ID"
            },
            "step3": {
                "title": "Отсканируйте наш QR-код",
                "desc": "Откройте WeChat, нажмите «+» в правом верхнем углу, выберите «Сканировать» и наведите камеру на наш QR-код выше."
            },
            "step4": {
                "title": "Отправьте сообщение",
                "desc": "После добавления отправьте нам сообщение с требованиями к продукции. Наша команда отвечает в течение 12 часов.",
                "tip": "Совет: указание подробностей (стиль, количество, целевая цена) поможет нам быстрее дать точный расчёт."
            },
            "whatsappTitle": "Предпочитаете WhatsApp?",
            "whatsappDesc": "Мы также отвечаем в WhatsApp для вашего удобства",
            "whatsappBtn": "Написать в WhatsApp",
            "contactPrompt": "Или отправьте запрос прямо через наш сайт",
            "contactBtn": "Отправить запрос"
        }
    },
    "ar": {
        "wechatGuide": {
            "title": "كيفية استخدام WeChat",
            "subtitle": "WeChat هو التطبيق الأكثر شعبية للمراسلة في الصين. اتبع هذه الخطوات للتواصل معنا والحصول على عروض أسعار فورية.",
            "qrTitle": "رمز QR الخاص بنا على WeChat",
            "qrDesc": "امسح رمز QR هذا باستخدام WeChat لإضافتنا كجهة اتصال",
            "step1": {
                "title": "تحميل WeChat",
                "desc": "WeChat متاح مجانًا على iOS و Android. حمّله من App Store أو Google Play."
            },
            "step2": {
                "title": "تسجيل حساب",
                "desc": "افتح WeChat وسجّل برقم هاتفك. مطلوب التحقق.",
                "tip1": "استخدم رقم هاتفك الحقيقي للتحقق",
                "tip2": "عيّن معرّف WeChat سهل التذكر"
            },
            "step3": {
                "title": "امسح رمز QR الخاص بنا",
                "desc": "افتح WeChat، اضغط على أيقونة '+' في أعلى اليمين، اختر 'مسح'، ووجّه الكاميرا نحو رمز QR أعلاه."
            },
            "step4": {
                "title": "أرسل رسالة",
                "desc": "بعد الإضافة، أرسل لنا رسالة بمتطلبات منتجك. فريقنا يرد خلال 12 ساعة.",
                "tip": "نصيحة: إرسال تفاصيل احتياجاتك (النمط، الكمية، السعر المستهدف) يساعدنا على الرد بشكل أسرع بعروض دقيقة."
            },
            "whatsappTitle": "تفضل WhatsApp؟",
            "whatsappDesc": "نرد أيضًا على WhatsApp لراحتك",
            "whatsappBtn": "الدردشة على WhatsApp",
            "contactPrompt": "أو أرسل استفسارًا مباشرة عبر موقعنا",
            "contactBtn": "إرسال استفسار"
        }
    },
    "de": {
        "wechatGuide": {
            "title": "So verwenden Sie WeChat",
            "subtitle": "WeChat ist die beliebteste Messaging-App in China. Folgen Sie diesen Schritten, um mit uns in Kontakt zu treten und Sofortangebote zu erhalten.",
            "qrTitle": "Unser WeChat-QR-Code",
            "qrDesc": "Scannen Sie diesen QR-Code mit WeChat, um uns als Kontakt hinzuzufügen",
            "step1": {
                "title": "WeChat herunterladen",
                "desc": "WeChat ist kostenlos für iOS und Android. Laden Sie es aus dem App Store oder Google Play herunter."
            },
            "step2": {
                "title": "Konto registrieren",
                "desc": "Öffnen Sie WeChat und registrieren Sie sich mit Ihrer Telefonnummer. Eine Verifizierung ist erforderlich.",
                "tip1": "Verwenden Sie Ihre echte Telefonnummer für die Verifizierung",
                "tip2": "Legen Sie eine einprägsame WeChat-ID fest"
            },
            "step3": {
                "title": "Scannen Sie unseren QR-Code",
                "desc": "Öffnen Sie WeChat, tippen Sie oben rechts auf '+', wählen Sie 'Scannen' und richten Sie die Kamera auf unseren QR-Code oben."
            },
            "step4": {
                "title": "Nachricht senden",
                "desc": "Senden Sie uns nach dem Hinzufügen eine Nachricht mit Ihren Produktanforderungen. Unser Team antwortet innerhalb von 12 Stunden.",
                "tip": "Tipp: Das Senden von Details (Stil, Menge, Zielpreis) hilft uns, schneller mit genauen Angeboten zu antworten."
            },
            "whatsappTitle": "Lieber WhatsApp?",
            "whatsappDesc": "Wir antworten auch auf WhatsApp für Ihre Bequemlichkeit",
            "whatsappBtn": "Auf WhatsApp chatten",
            "contactPrompt": "Oder senden Sie eine Anfrage direkt über unsere Website",
            "contactBtn": "Anfrage senden"
        }
    },
    "es": {
        "wechatGuide": {
            "title": "Cómo usar WeChat",
            "subtitle": "WeChat es la aplicación de mensajería más popular en China. Siga estos pasos para conectarse con nosotros y obtener cotizaciones instantáneas.",
            "qrTitle": "Nuestro código QR de WeChat",
            "qrDesc": "Escanee este código QR con WeChat para agregarnos como contacto",
            "step1": {
                "title": "Descargar WeChat",
                "desc": "WeChat está disponible gratis en iOS y Android. Descárguelo de App Store o Google Play."
            },
            "step2": {
                "title": "Registrar una cuenta",
                "desc": "Abra WeChat y regístrese con su número de teléfono. Se requiere verificación.",
                "tip1": "Use su número de teléfono real para la verificación",
                "tip2": "Establezca un ID de WeChat memorable"
            },
            "step3": {
                "title": "Escanee nuestro código QR",
                "desc": "Abra WeChat, toque el icono '+' en la parte superior derecha, seleccione 'Escanear' y apunte la cámara a nuestro código QR."
            },
            "step4": {
                "title": "Enviar un mensaje",
                "desc": "Una vez agregado, envíenos un mensaje con sus requisitos de producto. Nuestro equipo responde en 12 horas.",
                "tip": "Consejo: Enviar detalles (estilo, cantidad, precio objetivo) nos ayuda a responder más rápido con cotizaciones precisas."
            },
            "whatsappTitle": "¿Prefiere WhatsApp?",
            "whatsappDesc": "También respondemos en WhatsApp para su conveniencia",
            "whatsappBtn": "Chatear en WhatsApp",
            "contactPrompt": "O envíe una consulta directamente a través de nuestro sitio web",
            "contactBtn": "Enviar consulta"
        }
    },
    "fr": {
        "wechatGuide": {
            "title": "Comment utiliser WeChat",
            "subtitle": "WeChat est l'application de messagerie la plus populaire en Chine. Suivez ces étapes pour nous contacter et obtenir des devis instantanés.",
            "qrTitle": "Notre code QR WeChat",
            "qrDesc": "Scannez ce code QR avec WeChat pour nous ajouter comme contact",
            "step1": {
                "title": "Télécharger WeChat",
                "desc": "WeChat est disponible gratuitement sur iOS et Android. Téléchargez-le depuis l'App Store ou Google Play."
            },
            "step2": {
                "title": "Créer un compte",
                "desc": "Ouvrez WeChat et inscrivez-vous avec votre numéro de téléphone. Une vérification est requise.",
                "tip1": "Utilisez votre vrai numéro de téléphone pour la vérification",
                "tip2": "Définissez un identifiant WeChat mémorable"
            },
            "step3": {
                "title": "Scannez notre code QR",
                "desc": "Ouvrez WeChat, appuyez sur l'icône '+' en haut à droite, sélectionnez 'Scanner' et pointez la caméra vers notre code QR."
            },
            "step4": {
                "title": "Envoyer un message",
                "desc": "Une fois ajouté, envoyez-nous un message avec vos besoins en produits. Notre équipe répond dans les 12 heures.",
                "tip": "Astuce : Envoyer des détails (style, quantité, prix cible) nous aide à répondre plus rapidement avec des devis précis."
            },
            "whatsappTitle": "Vous préférez WhatsApp ?",
            "whatsappDesc": "Nous répondons également sur WhatsApp pour votre commodité",
            "whatsappBtn": "Discuter sur WhatsApp",
            "contactPrompt": "Ou envoyez une demande directement via notre site web",
            "contactBtn": "Envoyer une demande"
        }
    },
    "ja": {
        "wechatGuide": {
            "title": "WeChatの使い方",
            "subtitle": "WeChatは中国で最も人気のあるメッセージアプリです。以下の手順で私たちと繋がり、即時見積もりを取得しましょう。",
            "qrTitle": "私たちのWeChat QRコード",
            "qrDesc": "WeChatでこのQRコードをスキャンして連絡先に追加してください",
            "step1": {
                "title": "WeChatをダウンロード",
                "desc": "WeChatはiOSとAndroidの両方で無料で利用できます。App StoreまたはGoogle Playからダウンロードしてください。"
            },
            "step2": {
                "title": "アカウント登録",
                "desc": "WeChatを開き、電話番号で登録します。認証が必要です。",
                "tip1": "認証には実際の電話番号を使用してください",
                "tip2": "覚えやすいWeChat IDを設定してください"
            },
            "step3": {
                "title": "QRコードをスキャン",
                "desc": "WeChatを開き、右上の「+」アイコンをタップし、「スキャン」を選択して、上のQRコードにカメラを向けてください。"
            },
            "step4": {
                "title": "メッセージを送信",
                "desc": "追加後、製品の要件とともにメッセージを送信してください。当社チームは12時間以内に返信します。",
                "tip": "ヒント：製品の詳細（スタイル、数量、目標価格）を送信すると、より正確な見積もりを早く提供できます。"
            },
            "whatsappTitle": "WhatsAppをご希望ですか？",
            "whatsappDesc": "WhatsAppでもご対応しております",
            "whatsappBtn": "WhatsAppでチャット",
            "contactPrompt": "または当社サイトから直接お問い合わせください",
            "contactBtn": "お問い合わせ送信"
        }
    },
    "pt": {
        "wechatGuide": {
            "title": "Como usar o WeChat",
            "subtitle": "O WeChat é o aplicativo de mensagens mais popular na China. Siga estes passos para se conectar conosco e obter cotações instantâneas.",
            "qrTitle": "Nosso código QR do WeChat",
            "qrDesc": "Leia este código QR com o WeChat para nos adicionar como contato",
            "step1": {
                "title": "Baixar o WeChat",
                "desc": "O WeChat está disponível gratuitamente para iOS e Android. Baixe-o na App Store ou Google Play."
            },
            "step2": {
                "title": "Registrar uma conta",
                "desc": "Abra o WeChat e registre-se com seu número de telefone. Verificação é necessária.",
                "tip1": "Use seu número de telefone real para verificação",
                "tip2": "Defina um ID WeChat memorável"
            },
            "step3": {
                "title": "Leia nosso código QR",
                "desc": "Abra o WeChat, toque no ícone '+' no canto superior direito, selecione 'Escanear' e aponte a câmera para nosso código QR acima."
            },
            "step4": {
                "title": "Envie uma mensagem",
                "desc": "Após adicionar, envie-nos uma mensagem com seus requisitos de produto. Nossa equipe responde em 12 horas.",
                "tip": "Dica: Enviar detalhes (estilo, quantidade, preço alvo) nos ajuda a responder mais rápido com cotações precisas."
            },
            "whatsappTitle": "Prefere WhatsApp?",
            "whatsappDesc": "Também respondemos no WhatsApp para sua conveniência",
            "whatsappBtn": "Conversar no WhatsApp",
            "contactPrompt": "Ou envie uma consulta diretamente pelo nosso site",
            "contactBtn": "Enviar consulta"
        }
    }
}

for locale, guide in guides.items():
    filepath = f"messages/{locale}.json"
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "wechatGuide" not in data:
        data["wechatGuide"] = guide["wechatGuide"]
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {filepath}")
    else:
        print(f"SKIP: {filepath} (already exists)")
