import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../lib/storage";

const resources = {
  en: {
    translation: {
      brand: {
        name: "ba2i3 Store",
        tagline: "Smart shopping, premium experience"
      },
      meta: {
        products: "Products - ba2i3 Store",
        productDetails: "Product details - ba2i3 Store",
        login: "Login - ba2i3 Store",
        register: "Register - ba2i3 Store",
        admin: "Admin - ba2i3 Store",
        checkout: "Checkout - ba2i3 Store",
        profile: "Profile - ba2i3 Store",
        settings: "Settings - ba2i3 Store",
        policy: "Policy - ba2i3 Store"
      },
      nav: {
        products: "Products",
        login: "Login",
        register: "Register",
        admin: "Admin",
        cart: "Cart",
        profile: "Profile",
        settings: "Settings",
        checkout: "Checkout"
      },
      language: {
        en: "EN",
        fr: "FR",
        ar: "AR"
      },
      theme: {
        dark: "Dark",
        light: "Light"
      },
      actions: {
        buyNow: "Buy now",
        addToCart: "Add to cart",
        view: "View",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        back: "Back to products",
        submit: "Submit"
      },
      common: {
        allCategories: "All categories",
        search: "Search",
        loading: "Loading...",
        noResults: "No products found",
        noResultsHint: "Try another search or category.",
        source: "Data source: {{source}}",
        sourceApi: "API",
        sourceMock: "Local fallback",
        currency: "MAD",
        status: "Status",
        active: "Active",
        outOfStock: "Out of stock"
      },
      footer: {
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        refundPolicy: "Refund Policy",
        shippingPolicy: "Shipping Policy",
        rights: "All rights reserved."
      },
      contact: {
        button: "Contact Us",
        title: "Contact Us",
        subtitle: "Send us your message and we will reply soon.",
        email: "Email",
        message: "Message",
        messagePlaceholder: "How can we help you?",
        submit: "Send message",
        sending: "Sending...",
        success: "Message sent successfully.",
        failed: "Unable to send message."
      },
      products: {
        title: "Products",
        subtitle: "Discover our curated collection with a clean premium catalog.",
        featured: "Featured Product",
        featuredHint: "Best seller this week",
        searchPlaceholder: "Search products...",
        categoryPlaceholder: "Select category",
        results: "Results: {{count}}",
        addToast: "Added to cart.",
        cardFallback: "No image",
        heroFallback: "Featured image",
        sectionTitle: "Catalog",
        compactMode: "Compact cards"
      },
      product: {
        notFoundTitle: "Product not found",
        notFoundHint: "This product is unavailable right now.",
        shippingNote: "Fast delivery and secure checkout.",
        related: "Related products",
        addToast: "Product added to cart."
      },
      auth: {
        loginTitle: "Sign in",
        registerTitle: "Create account",
        loginSubtitle: "Access your customer space quickly.",
        registerSubtitle: "Create your account in seconds.",
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        password: "Password",
        forgotPassword: "Forgot password?",
        loginButton: "Sign in",
        registerButton: "Create account",
        switchToLogin: "Already have an account?",
        switchToRegister: "Don't have an account?",
        missingFields: "Please complete all required fields.",
        loginSuccess: "Signed in successfully.",
        registerSuccess: "Account created successfully.",
        requestFailed: "Request failed."
      },
      admin: {
        title: "Admin dashboard",
        subtitle: "Manage products with a professional control panel.",
        mode: "Mode",
        modeApi: "Connected to API",
        modeMock: "Local fallback mode",
        tokenLabel: "Admin token",
        tokenPlaceholder: "Enter x-admin-token",
        tokenHint: "Required for backend create/update/delete.",
        saveToken: "Save token",
        tokenSaved: "Token saved.",
        tokenRequired: "Add a token to sync with backend.",
        formCreate: "Add product",
        formEdit: "Edit product #{{id}}",
        name: "Product name",
        price: "Price",
        category: "Category",
        stock: "Stock",
        emoji: "Emoji",
        image: "Image URL",
        description: "Description",
        submitCreate: "Add product",
        submitUpdate: "Update product",
        cancelEdit: "Cancel edit",
        listTitle: "Products management",
        searchPlaceholder: "Search by name, category or description...",
        tableImage: "Image",
        tableProduct: "Product",
        tablePrice: "Price",
        tableStock: "Stock",
        tableStatus: "Status",
        tableActions: "Actions",
        empty: "No products available.",
        savedApi: "Saved to API.",
        savedLocal: "Saved locally.",
        deletedApi: "Deleted from API.",
        deletedLocal: "Deleted locally.",
        loadFailed: "Could not load products."
      },
      checkout: {
        title: "Secure Checkout",
        subtitle: "Pay safely with Stripe Payment Element.",
        empty: "Your cart is empty.",
        goShop: "Continue shopping",
        summary: "Order summary",
        cardTitle: "Card payment",
        payNow: "Pay now",
        processing: "Processing...",
        success: "Payment completed successfully.",
        createIntentError: "Failed to initialize payment."
      },
      profile: {
        title: "Profile",
        subtitle: "Customer profile area coming soon."
      },
      settings: {
        title: "Settings",
        subtitle: "Adjust language and theme preferences.",
        appearance: "Appearance",
        language: "Language"
      },
      policy: {
        back: "Back to store",
        privacyPolicy: {
          title: "Privacy Policy",
          body: "We collect only the information needed to process your orders and improve service quality."
        },
        termsOfService: {
          title: "Terms of Service",
          body: "By using ba2i3 Store, you agree to comply with store policies and secure checkout rules."
        },
        refundPolicy: {
          title: "Refund Policy",
          body: "Eligible products can be refunded according to product condition and return window."
        },
        shippingPolicy: {
          title: "Shipping Policy",
          body: "Shipping times vary by region. Tracking details are shared once the order is confirmed."
        }
      }
    }
  },
  fr: {
    translation: {
      brand: {
        name: "ba2i3 Store",
        tagline: "Shopping intelligent, experience premium"
      },
      meta: {
        products: "Produits - ba2i3 Store",
        productDetails: "Detail produit - ba2i3 Store",
        login: "Connexion - ba2i3 Store",
        register: "Inscription - ba2i3 Store",
        admin: "Admin - ba2i3 Store",
        checkout: "Paiement - ba2i3 Store",
        profile: "Profil - ba2i3 Store",
        settings: "Parametres - ba2i3 Store",
        policy: "Politique - ba2i3 Store"
      },
      nav: {
        products: "Produits",
        login: "Connexion",
        register: "Inscription",
        admin: "Admin",
        cart: "Panier",
        profile: "Profil",
        settings: "Parametres",
        checkout: "Paiement"
      },
      language: {
        en: "EN",
        fr: "FR",
        ar: "AR"
      },
      theme: {
        dark: "Sombre",
        light: "Clair"
      },
      actions: {
        buyNow: "Acheter",
        addToCart: "Ajouter",
        view: "Voir",
        save: "Sauvegarder",
        cancel: "Annuler",
        edit: "Modifier",
        delete: "Supprimer",
        back: "Retour produits",
        submit: "Valider"
      },
      common: {
        allCategories: "Toutes categories",
        search: "Recherche",
        loading: "Chargement...",
        noResults: "Aucun produit trouve",
        noResultsHint: "Essayez une autre recherche ou categorie.",
        source: "Source de donnees : {{source}}",
        sourceApi: "API",
        sourceMock: "Secours local",
        currency: "MAD",
        status: "Statut",
        active: "Actif",
        outOfStock: "Rupture"
      },
      footer: {
        privacyPolicy: "Politique de confidentialite",
        termsOfService: "Conditions de service",
        refundPolicy: "Politique de remboursement",
        shippingPolicy: "Politique de livraison",
        rights: "Tous droits reserves."
      },
      contact: {
        button: "Contactez-nous",
        title: "Contactez-nous",
        subtitle: "Envoyez votre message et notre equipe vous repondra.",
        email: "Email",
        message: "Message",
        messagePlaceholder: "Comment pouvons-nous vous aider ?",
        submit: "Envoyer",
        sending: "Envoi...",
        success: "Message envoye avec succes.",
        failed: "Impossible d'envoyer le message."
      },
      products: {
        title: "Produits",
        subtitle: "Decouvrez notre selection avec un catalogue premium et clair.",
        featured: "Produit vedette",
        featuredHint: "Meilleure vente de la semaine",
        searchPlaceholder: "Rechercher des produits...",
        categoryPlaceholder: "Choisir une categorie",
        results: "Resultats : {{count}}",
        addToast: "Ajoute au panier.",
        cardFallback: "Sans image",
        heroFallback: "Image vedette",
        sectionTitle: "Catalogue",
        compactMode: "Cartes compactes"
      },
      product: {
        notFoundTitle: "Produit introuvable",
        notFoundHint: "Ce produit est indisponible pour le moment.",
        shippingNote: "Livraison rapide et paiement securise.",
        related: "Produits similaires",
        addToast: "Produit ajoute au panier."
      },
      auth: {
        loginTitle: "Connexion",
        registerTitle: "Creer un compte",
        loginSubtitle: "Accedez rapidement a votre espace client.",
        registerSubtitle: "Creez votre compte en quelques secondes.",
        firstName: "Prenom",
        lastName: "Nom",
        email: "Email",
        password: "Mot de passe",
        forgotPassword: "Mot de passe oublie ?",
        loginButton: "Connexion",
        registerButton: "Creer un compte",
        switchToLogin: "Vous avez deja un compte ?",
        switchToRegister: "Vous n'avez pas de compte ?",
        missingFields: "Veuillez remplir tous les champs obligatoires.",
        loginSuccess: "Connexion reussie.",
        registerSuccess: "Compte cree avec succes.",
        requestFailed: "Echec de la requete."
      },
      admin: {
        title: "Tableau de bord admin",
        subtitle: "Gerez les produits avec un panneau professionnel.",
        mode: "Mode",
        modeApi: "Connecte a l'API",
        modeMock: "Mode secours local",
        tokenLabel: "Token admin",
        tokenPlaceholder: "Saisir x-admin-token",
        tokenHint: "Necessaire pour creer/modifier/supprimer via backend.",
        saveToken: "Sauvegarder le token",
        tokenSaved: "Token sauvegarde.",
        tokenRequired: "Ajoutez un token pour synchroniser avec le backend.",
        formCreate: "Ajouter un produit",
        formEdit: "Modifier produit #{{id}}",
        name: "Nom du produit",
        price: "Prix",
        category: "Categorie",
        stock: "Stock",
        emoji: "Emoji",
        image: "URL image",
        description: "Description",
        submitCreate: "Ajouter produit",
        submitUpdate: "Mettre a jour",
        cancelEdit: "Annuler modification",
        listTitle: "Gestion des produits",
        searchPlaceholder: "Recherche par nom, categorie ou description...",
        tableImage: "Image",
        tableProduct: "Produit",
        tablePrice: "Prix",
        tableStock: "Stock",
        tableStatus: "Statut",
        tableActions: "Actions",
        empty: "Aucun produit disponible.",
        savedApi: "Sauvegarde dans l'API.",
        savedLocal: "Sauvegarde locale.",
        deletedApi: "Supprime de l'API.",
        deletedLocal: "Supprime localement.",
        loadFailed: "Impossible de charger les produits."
      },
      checkout: {
        title: "Paiement securise",
        subtitle: "Payez en toute securite avec Stripe Payment Element.",
        empty: "Votre panier est vide.",
        goShop: "Continuer les achats",
        summary: "Resume de commande",
        cardTitle: "Paiement par carte",
        payNow: "Payer maintenant",
        processing: "Traitement...",
        success: "Paiement valide avec succes.",
        createIntentError: "Impossible d'initialiser le paiement."
      },
      profile: {
        title: "Profil",
        subtitle: "Espace profil client bientot disponible."
      },
      settings: {
        title: "Parametres",
        subtitle: "Ajustez la langue et le theme.",
        appearance: "Apparence",
        language: "Langue"
      },
      policy: {
        back: "Retour boutique",
        privacyPolicy: {
          title: "Politique de confidentialite",
          body: "Nous collectons uniquement les informations necessaires pour traiter vos commandes."
        },
        termsOfService: {
          title: "Conditions de service",
          body: "En utilisant ba2i3 Store, vous acceptez les politiques de la boutique et les regles de paiement."
        },
        refundPolicy: {
          title: "Politique de remboursement",
          body: "Les produits eligibles peuvent etre rembourses selon leur etat et la periode de retour."
        },
        shippingPolicy: {
          title: "Politique de livraison",
          body: "Les delais de livraison varient selon la region. Le suivi est partage apres confirmation."
        }
      }
    }
  },
  ar: {
    translation: {
      brand: {
        name: "متجر ba2i3",
        tagline: "تسوق ذكي وتجربة احترافية"
      },
      meta: {
        products: "المنتجات - متجر ba2i3",
        productDetails: "تفاصيل المنتج - متجر ba2i3",
        login: "تسجيل الدخول - متجر ba2i3",
        register: "إنشاء حساب - متجر ba2i3",
        admin: "الإدارة - متجر ba2i3",
        checkout: "الدفع - متجر ba2i3",
        profile: "الملف الشخصي - متجر ba2i3",
        settings: "الإعدادات - متجر ba2i3",
        policy: "السياسة - متجر ba2i3"
      },
      nav: {
        products: "المنتجات",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        admin: "الإدارة",
        cart: "السلة",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        checkout: "الدفع"
      },
      language: {
        en: "EN",
        fr: "FR",
        ar: "AR"
      },
      theme: {
        dark: "داكن",
        light: "فاتح"
      },
      actions: {
        buyNow: "اشتر الآن",
        addToCart: "أضف للسلة",
        view: "عرض",
        save: "حفظ",
        cancel: "إلغاء",
        edit: "تعديل",
        delete: "حذف",
        back: "العودة للمنتجات",
        submit: "إرسال"
      },
      common: {
        allCategories: "كل الفئات",
        search: "بحث",
        loading: "جاري التحميل...",
        noResults: "لا توجد منتجات",
        noResultsHint: "جرّب بحثًا أو فئة أخرى.",
        source: "مصدر البيانات: {{source}}",
        sourceApi: "API",
        sourceMock: "مصدر محلي",
        currency: "درهم",
        status: "الحالة",
        active: "متاح",
        outOfStock: "نفدت الكمية"
      },
      footer: {
        privacyPolicy: "سياسة الخصوصية",
        termsOfService: "شروط الخدمة",
        refundPolicy: "سياسة الاسترجاع",
        shippingPolicy: "سياسة الشحن",
        rights: "جميع الحقوق محفوظة."
      },
      contact: {
        button: "اتصل بنا",
        title: "اتصل بنا",
        subtitle: "أرسل رسالتك وسنقوم بالرد عليك في أقرب وقت.",
        email: "البريد الإلكتروني",
        message: "الرسالة",
        messagePlaceholder: "كيف يمكننا مساعدتك؟",
        submit: "إرسال الرسالة",
        sending: "جاري الإرسال...",
        success: "تم إرسال الرسالة بنجاح.",
        failed: "تعذر إرسال الرسالة."
      },
      products: {
        title: "المنتجات",
        subtitle: "اكتشف مجموعتنا المختارة بتصميم احترافي واضح.",
        featured: "المنتج المميز",
        featuredHint: "الأكثر مبيعًا هذا الأسبوع",
        searchPlaceholder: "ابحث عن المنتجات...",
        categoryPlaceholder: "اختر الفئة",
        results: "النتائج: {{count}}",
        addToast: "تمت الإضافة إلى السلة.",
        cardFallback: "بدون صورة",
        heroFallback: "صورة مميزة",
        sectionTitle: "الكتالوج",
        compactMode: "بطاقات مدمجة"
      },
      product: {
        notFoundTitle: "المنتج غير موجود",
        notFoundHint: "هذا المنتج غير متاح حالياً.",
        shippingNote: "توصيل سريع ودفع آمن.",
        related: "منتجات مشابهة",
        addToast: "تمت إضافة المنتج إلى السلة."
      },
      auth: {
        loginTitle: "تسجيل الدخول",
        registerTitle: "إنشاء حساب",
        loginSubtitle: "ادخل إلى حسابك بسرعة.",
        registerSubtitle: "أنشئ حسابك خلال ثوانٍ.",
        firstName: "الاسم الأول",
        lastName: "الاسم الأخير",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        forgotPassword: "هل نسيت كلمة المرور؟",
        loginButton: "تسجيل الدخول",
        registerButton: "إنشاء حساب",
        switchToLogin: "لديك حساب بالفعل؟",
        switchToRegister: "ليس لديك حساب؟",
        missingFields: "يرجى إكمال جميع الحقول المطلوبة.",
        loginSuccess: "تم تسجيل الدخول بنجاح.",
        registerSuccess: "تم إنشاء الحساب بنجاح.",
        requestFailed: "فشل الطلب."
      },
      admin: {
        title: "لوحة الإدارة",
        subtitle: "إدارة المنتجات من خلال لوحة تحكم احترافية.",
        mode: "الوضع",
        modeApi: "متصل بالـ API",
        modeMock: "وضع محلي احتياطي",
        tokenLabel: "رمز الإدارة",
        tokenPlaceholder: "أدخل x-admin-token",
        tokenHint: "مطلوب للإضافة والتعديل والحذف عبر الخادم.",
        saveToken: "حفظ الرمز",
        tokenSaved: "تم حفظ الرمز.",
        tokenRequired: "أضف الرمز للمزامنة مع الخادم.",
        formCreate: "إضافة منتج",
        formEdit: "تعديل المنتج #{{id}}",
        name: "اسم المنتج",
        price: "السعر",
        category: "الفئة",
        stock: "المخزون",
        emoji: "إيموجي",
        image: "رابط الصورة",
        description: "الوصف",
        submitCreate: "إضافة منتج",
        submitUpdate: "تحديث المنتج",
        cancelEdit: "إلغاء التعديل",
        listTitle: "إدارة المنتجات",
        searchPlaceholder: "ابحث بالاسم أو الفئة أو الوصف...",
        tableImage: "الصورة",
        tableProduct: "المنتج",
        tablePrice: "السعر",
        tableStock: "المخزون",
        tableStatus: "الحالة",
        tableActions: "الإجراءات",
        empty: "لا توجد منتجات.",
        savedApi: "تم الحفظ في API.",
        savedLocal: "تم الحفظ محليًا.",
        deletedApi: "تم الحذف من API.",
        deletedLocal: "تم الحذف محليًا.",
        loadFailed: "تعذر تحميل المنتجات."
      },
      checkout: {
        title: "دفع آمن",
        subtitle: "ادفع بأمان عبر Stripe Payment Element.",
        empty: "السلة فارغة.",
        goShop: "متابعة التسوق",
        summary: "ملخص الطلب",
        cardTitle: "الدفع بالبطاقة",
        payNow: "ادفع الآن",
        processing: "جاري المعالجة...",
        success: "تم الدفع بنجاح.",
        createIntentError: "تعذر تهيئة عملية الدفع."
      },
      profile: {
        title: "الملف الشخصي",
        subtitle: "صفحة الملف الشخصي ستكون متاحة قريبًا."
      },
      settings: {
        title: "الإعدادات",
        subtitle: "قم بضبط اللغة والمظهر.",
        appearance: "المظهر",
        language: "اللغة"
      },
      policy: {
        back: "العودة للمتجر",
        privacyPolicy: {
          title: "سياسة الخصوصية",
          body: "نقوم بجمع البيانات الضرورية فقط لمعالجة الطلبات وتحسين جودة الخدمة."
        },
        termsOfService: {
          title: "شروط الخدمة",
          body: "باستخدام متجر ba2i3 فإنك توافق على سياسات المتجر وقواعد الدفع الآمن."
        },
        refundPolicy: {
          title: "سياسة الاسترجاع",
          body: "يمكن استرجاع المنتجات المؤهلة وفق حالة المنتج وفترة الإرجاع المعتمدة."
        },
        shippingPolicy: {
          title: "سياسة الشحن",
          body: "تختلف مدة الشحن حسب المنطقة ويتم إرسال تفاصيل التتبع بعد تأكيد الطلب."
        }
      }
    }
  }
};

function readSavedLanguage() {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return ["en", "fr", "ar"].includes(value) ? value : "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: readSavedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  supportedLngs: ["en", "fr", "ar"]
});

export default i18n;
