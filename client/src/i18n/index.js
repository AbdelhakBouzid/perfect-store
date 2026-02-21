import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../lib/storage";

const resources = {
  en: {
    translation: {
      brand: {
        name: "Perfect Store",
        tagline: "Blue Glass Commerce"
      },
      meta: {
        products: "Products - Perfect Store",
        productDetails: "Product details - Perfect Store",
        login: "Login - Perfect Store",
        register: "Register - Perfect Store",
        admin: "Admin - Perfect Store"
      },
      nav: {
        products: "Products",
        login: "Login",
        register: "Register",
        admin: "Admin"
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
        sourceMock: "Local mock",
        currency: "MAD",
        status: "Status",
        active: "Active",
        outOfStock: "Out of stock"
      },
      footer: {
        privacy: "Privacy",
        terms: "Terms",
        contact: "Contact",
        refund: "Refund",
        rights: "All rights reserved."
      },
      products: {
        title: "Products",
        subtitle: "Modern devices in a unified blue glass system.",
        featured: "Featured product",
        bestSeller: "Best seller",
        newest: "Newest",
        searchPlaceholder: "Search products...",
        categoryPlaceholder: "Select category",
        browse: "Browse products",
        results: "Results: {{count}}",
        addToast: "Added to cart.",
        cardFallback: "No image",
        heroFallback: "Featured image",
        sectionTitle: "Product catalog"
      },
      product: {
        notFoundTitle: "Product not found",
        notFoundHint: "This product does not exist in the selected source.",
        details: "Product details",
        shippingNote: "Fast delivery and secure checkout.",
        related: "Related products",
        addToast: "Product added to cart."
      },
      auth: {
        leftMessageTop: "Share the Knowledge, Spread the Fun",
        leftMessageBottom: "with SupShare",
        loginTitle: "Sign in",
        registerTitle: "Sign up",
        loginSubtitle: "Simplify your career, sign in effortlessly",
        registerSubtitle: "Simplify your career, sign up effortlessly",
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        password: "Password",
        forgotPassword: "Forgot password?",
        day: "Day",
        month: "Month",
        year: "Year",
        dateOfBirth: "Date of birth",
        gender: "Gender",
        male: "Male",
        female: "Female",
        termsPrefix: "By signing up, you acknowledge that you have read and agree to our",
        termsService: "Terms of Service",
        termsConnector: "and",
        termsPrivacy: "Privacy Policy.",
        termsSuffix: "You also consent to receive email or SMS communications from us, which you can opt out of at any time.",
        loginButton: "Sign in",
        registerButton: "Sign up",
        switchToLogin: "Or Sign in",
        switchToRegister: "Or Sign up",
        missingFields: "Please complete all required fields.",
        loginSuccess: "Signed in successfully.",
        registerSuccess: "Account created successfully.",
        requestFailed: "Request failed."
      },
      admin: {
        title: "Admin dashboard",
        subtitle: "Manage products with the same glass design language.",
        mode: "Mode",
        modeApi: "Connected to API",
        modeMock: "Mock mode (offline fallback)",
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
      }
    }
  },
  fr: {
    translation: {
      brand: {
        name: "Perfect Store",
        tagline: "Commerce Blue Glass"
      },
      meta: {
        products: "Produits - Perfect Store",
        productDetails: "Détails produit - Perfect Store",
        login: "Connexion - Perfect Store",
        register: "Inscription - Perfect Store",
        admin: "Admin - Perfect Store"
      },
      nav: {
        products: "Produits",
        login: "Connexion",
        register: "Inscription",
        admin: "Admin"
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
        allCategories: "Toutes les catégories",
        search: "Recherche",
        loading: "Chargement...",
        noResults: "Aucun produit trouvé",
        noResultsHint: "Essayez une autre recherche ou catégorie.",
        source: "Source de données : {{source}}",
        sourceApi: "API",
        sourceMock: "Mock local",
        currency: "MAD",
        status: "Statut",
        active: "Actif",
        outOfStock: "Rupture de stock"
      },
      footer: {
        privacy: "Confidentialité",
        terms: "Conditions",
        contact: "Contact",
        refund: "Remboursement",
        rights: "Tous droits réservés."
      },
      products: {
        title: "Produits",
        subtitle: "Appareils modernes dans une interface blue glass unifiée.",
        featured: "Produit vedette",
        bestSeller: "Meilleure vente",
        newest: "Nouveau",
        searchPlaceholder: "Rechercher des produits...",
        categoryPlaceholder: "Choisir une catégorie",
        browse: "Parcourir les produits",
        results: "Résultats : {{count}}",
        addToast: "Ajouté au panier.",
        cardFallback: "Sans image",
        heroFallback: "Image vedette",
        sectionTitle: "Catalogue produits"
      },
      product: {
        notFoundTitle: "Produit introuvable",
        notFoundHint: "Ce produit n'existe pas dans la source sélectionnée.",
        details: "Détails produit",
        shippingNote: "Livraison rapide et paiement sécurisé.",
        related: "Produits similaires",
        addToast: "Produit ajouté au panier."
      },
      auth: {
        leftMessageTop: "Partagez la connaissance, diffusez le fun",
        leftMessageBottom: "avec SupShare",
        loginTitle: "Connexion",
        registerTitle: "Inscription",
        loginSubtitle: "Simplifiez votre parcours, connectez-vous facilement",
        registerSubtitle: "Simplifiez votre parcours, inscrivez-vous facilement",
        firstName: "Prénom",
        lastName: "Nom",
        email: "Email",
        password: "Mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        day: "Jour",
        month: "Mois",
        year: "Année",
        dateOfBirth: "Date de naissance",
        gender: "Genre",
        male: "Homme",
        female: "Femme",
        termsPrefix: "En vous inscrivant, vous reconnaissez avoir lu et accepté nos",
        termsService: "Conditions d'utilisation",
        termsConnector: "et notre",
        termsPrivacy: "Politique de confidentialité.",
        termsSuffix: "Vous acceptez aussi de recevoir des emails ou SMS, avec possibilité de retrait à tout moment.",
        loginButton: "Connexion",
        registerButton: "Inscription",
        switchToLogin: "Ou Connexion",
        switchToRegister: "Ou Inscription",
        missingFields: "Veuillez remplir tous les champs obligatoires.",
        loginSuccess: "Connexion réussie.",
        registerSuccess: "Compte créé avec succès.",
        requestFailed: "Échec de la requête."
      },
      admin: {
        title: "Tableau de bord admin",
        subtitle: "Gérez les produits avec le même style glass.",
        mode: "Mode",
        modeApi: "Connecté à l'API",
        modeMock: "Mode mock (secours hors ligne)",
        tokenLabel: "Token admin",
        tokenPlaceholder: "Saisir x-admin-token",
        tokenHint: "Nécessaire pour créer/modifier/supprimer via backend.",
        saveToken: "Sauvegarder le token",
        tokenSaved: "Token sauvegardé.",
        tokenRequired: "Ajoutez un token pour synchroniser avec le backend.",
        formCreate: "Ajouter un produit",
        formEdit: "Modifier produit #{{id}}",
        name: "Nom du produit",
        price: "Prix",
        category: "Catégorie",
        stock: "Stock",
        emoji: "Emoji",
        image: "URL image",
        description: "Description",
        submitCreate: "Ajouter",
        submitUpdate: "Mettre à jour",
        cancelEdit: "Annuler la modification",
        listTitle: "Gestion des produits",
        searchPlaceholder: "Rechercher par nom, catégorie ou description...",
        tableImage: "Image",
        tableProduct: "Produit",
        tablePrice: "Prix",
        tableStock: "Stock",
        tableStatus: "Statut",
        tableActions: "Actions",
        empty: "Aucun produit disponible.",
        savedApi: "Sauvegardé dans l'API.",
        savedLocal: "Sauvegardé localement.",
        deletedApi: "Supprimé dans l'API.",
        deletedLocal: "Supprimé localement.",
        loadFailed: "Impossible de charger les produits."
      }
    }
  },
  ar: {
    translation: {
      brand: {
        name: "Perfect Store",
        tagline: "واجهة زجاجية زرقاء"
      },
      meta: {
        products: "المنتجات - Perfect Store",
        productDetails: "تفاصيل المنتج - Perfect Store",
        login: "تسجيل الدخول - Perfect Store",
        register: "إنشاء حساب - Perfect Store",
        admin: "لوحة الإدارة - Perfect Store"
      },
      nav: {
        products: "المنتجات",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        admin: "الإدارة"
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
        noResultsHint: "جرّب بحثًا أو فئة مختلفة.",
        source: "مصدر البيانات: {{source}}",
        sourceApi: "API",
        sourceMock: "بيانات محلية",
        currency: "درهم",
        status: "الحالة",
        active: "متاح",
        outOfStock: "نفدت الكمية"
      },
      footer: {
        privacy: "الخصوصية",
        terms: "الشروط",
        contact: "اتصل بنا",
        refund: "الاسترجاع",
        rights: "جميع الحقوق محفوظة."
      },
      products: {
        title: "المنتجات",
        subtitle: "أجهزة حديثة بنفس نظام التصميم الزجاجي الأزرق.",
        featured: "المنتج المميز",
        bestSeller: "الأكثر مبيعًا",
        newest: "الأحدث",
        searchPlaceholder: "ابحث عن المنتجات...",
        categoryPlaceholder: "اختر الفئة",
        browse: "تصفح المنتجات",
        results: "النتائج: {{count}}",
        addToast: "تمت الإضافة إلى السلة.",
        cardFallback: "بدون صورة",
        heroFallback: "صورة مميزة",
        sectionTitle: "كتالوج المنتجات"
      },
      product: {
        notFoundTitle: "المنتج غير موجود",
        notFoundHint: "هذا المنتج غير متوفر في المصدر الحالي.",
        details: "تفاصيل المنتج",
        shippingNote: "توصيل سريع ودفع آمن.",
        related: "منتجات مشابهة",
        addToast: "تمت إضافة المنتج إلى السلة."
      },
      auth: {
        leftMessageTop: "شارك المعرفة وانشر المتعة",
        leftMessageBottom: "مع SupShare",
        loginTitle: "تسجيل الدخول",
        registerTitle: "إنشاء حساب",
        loginSubtitle: "بسّط مسارك المهني وسجل الدخول بسهولة",
        registerSubtitle: "بسّط مسارك المهني وأنشئ حسابك بسهولة",
        firstName: "الاسم الأول",
        lastName: "الاسم الأخير",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        forgotPassword: "هل نسيت كلمة المرور؟",
        day: "اليوم",
        month: "الشهر",
        year: "السنة",
        dateOfBirth: "تاريخ الميلاد",
        gender: "الجنس",
        male: "ذكر",
        female: "أنثى",
        termsPrefix: "بالتسجيل، أنت تقر بأنك قرأت ووافقت على",
        termsService: "شروط الخدمة",
        termsConnector: "و",
        termsPrivacy: "سياسة الخصوصية.",
        termsSuffix: "كما توافق على تلقي رسائل بريد إلكتروني أو SMS ويمكنك إلغاء الاشتراك في أي وقت.",
        loginButton: "تسجيل الدخول",
        registerButton: "إنشاء حساب",
        switchToLogin: "أو تسجيل الدخول",
        switchToRegister: "أو إنشاء حساب",
        missingFields: "يرجى إكمال جميع الحقول المطلوبة.",
        loginSuccess: "تم تسجيل الدخول بنجاح.",
        registerSuccess: "تم إنشاء الحساب بنجاح.",
        requestFailed: "فشل الطلب."
      },
      admin: {
        title: "لوحة الإدارة",
        subtitle: "إدارة المنتجات بنفس أسلوب الزجاج الأزرق.",
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
        emoji: "رمز تعبيري",
        image: "رابط الصورة",
        description: "الوصف",
        submitCreate: "إضافة",
        submitUpdate: "تحديث",
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
