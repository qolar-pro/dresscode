'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'gr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.contact': 'Contact',
    'header.freeShipping': 'Free shipping on orders over $100',
    
    // Homepage
    'home.newCollection': 'New Collection 2026',
    'home.title1': 'DRESS',
    'home.title2': 'CODE',
    'home.subtitle': 'Redefine Your Style',
    'home.subtitle2': 'Curated fashion pieces for the modern woman',
    'home.shopCollection': 'Shop Collection',
    'home.visitStore': 'Visit Our Store',
    'home.scroll': 'Scroll',
    'home.happyClients': 'Happy Clients',
    'home.pieces': 'Pieces',
    'home.brands': 'Brands',
    'home.rating': 'Rating',
    'home.categories': 'Categories',
    'home.browseCollection': 'Browse Collection',
    'home.dresses': 'Dresses',
    'home.tops': 'Tops',
    'home.pants': 'Pants',
    'home.skirts': 'Skirts',
    'home.outerwear': 'Outerwear',
    'home.accessories': 'Accessories',
    'home.justLanded': 'Just Landed',
    'home.newArrivals': 'New Arrivals',
    'home.viewAll': 'View All',
    'home.theEdit': 'The Edit',
    'home.timelessElegance': 'Timeless Elegance',
    'home.timelessDesc': "Our curated collection brings together the finest pieces from around the world. Each item is selected for its quality, craftsmanship, and timeless appeal.",
    'home.discoverMore': 'Discover More',
    'home.featured': 'Curated For You',
    'home.featuredSelection': 'Featured Selection',
    'home.testimonial': '"The quality is exceptional. Every piece I\'ve purchased has become a staple in my wardrobe. DRESS CODE truly understands modern elegance."',
    'home.testimonialAuthor': '— Sarah Mitchell, Verified Client',
    'home.stayConnected': 'Stay Connected',
    'home.newsletterDesc': 'Be the first to know about new arrivals and exclusive offers',
    'home.emailPlaceholder': 'Your email address',
    'home.subscribe': 'Subscribe',
    'home.visitUs': 'Visit Us',
    'home.contactLabel': 'Contact',
    'home.hours': 'Hours',
    'home.address': '123 Fashion Street, Style District, NY 10001',
    'home.phone': '(555) 123-4567',
    'home.email': 'hello@dresscode.com',
    'home.hoursText': 'Mon - Sat: 9am - 8pm, Sunday: 11am - 5pm',
    
    // Shop
    'shop.title': 'Shop',
    'shop.collection': 'Collection',
    'shop.subtitle': 'Discover your perfect style',
    'shop.all': 'All',
    'shop.products': 'Products',
    'shop.product': 'Product',
    'shop.noProducts': 'No products found',
    'shop.noProductsDesc': 'Try adjusting your filters',
    'shop.clearFilters': 'Clear Filters',
    'shop.new': 'New',
    'shop.soldOut': 'Sold Out',
    
    // Product
    'product.back': 'Back',
    'product.sizeGuide': 'Size Guide',
    'product.quantity': 'Quantity',
    'product.addToCart': 'Add to Cart',
    'product.addedToCart': 'Added to Cart',
    'product.selectSize': 'Please select a size',
    'product.selectColor': 'Please select a color',
    'product.complimentaryShipping': 'Complimentary shipping on orders over $100',
    'product.cashOnDelivery': 'Cash on Delivery available',
    'product.easyReturns': 'Easy returns within 30 days',
    'product.details': 'Details',
    'product.description': 'Description',
    'product.sizeFit': 'Size & Fit',
    'product.modelWearing': 'Model is wearing size S',
    'product.fitsTrue': 'Fits true to size',
    'product.referToGuide': 'Refer to size guide for measurements',
    'product.notFound': 'Product Not Found',
    'product.backToShop': 'Back to Shop',
    
    // Cart
    'cart.title': 'Your Cart',
    'cart.items': 'items',
    'cart.item': 'item',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': 'Start adding your favorite items',
    'cart.startShopping': 'Start Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.complimentary': 'Complimentary',
    'cart.total': 'Total',
    'cart.complimentaryShipping': 'Complimentary shipping included',
    'cart.freeShippingProgress': 'Add ${amount} more for complimentary shipping',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    'cart.continueShopping': 'Continue Shopping',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.subtitle': 'Complete your order',
    'checkout.customerInfo': 'Customer Information',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.address': 'Street Address',
    'checkout.city': 'City',
    'checkout.zipCode': 'ZIP Code',
    'checkout.notes': 'Order Notes (Optional)',
    'checkout.notesPlaceholder': 'Special delivery instructions...',
    'checkout.cashOnDelivery': 'Cash on Delivery',
    'checkout.cashOnDeliveryDesc': 'Pay when your order arrives at your doorstep',
    'checkout.placeOrder': 'Place Order',
    'checkout.orderSummary': 'Order Summary',
    'checkout.items': 'Items',
    'checkout.complimentaryShipping': 'Complimentary shipping included',
    'checkout.freeShippingProgress': 'Add ${amount} more for complimentary shipping',
    'checkout.emptyCart': 'Your cart is empty',
    'checkout.thankYou': 'Thank You',
    'checkout.orderId': 'Order ID',
    'checkout.confirmationDesc': 'We will contact you soon to confirm your order details. Payment will be collected upon delivery.',
    'checkout.backToHome': 'Back to Home',
    'checkout.continueShopping': 'Continue Shopping',
    
    // Contact
    'contact.title': 'Contact',
    'contact.getLabel': 'Get in Touch',
    'contact.subtitle': "We'd love to hear from you",
    'contact.visitStore': 'Visit Our Store',
    'contact.callUs': 'Call Us',
    'contact.emailUs': 'Email Us',
    'contact.storeHours': 'Store Hours',
    'contact.followUs': 'Follow Us',
    'contact.sendMessage': 'Send us a Message',
    'contact.sendMessageDesc': 'Fill out the form below and we\'ll get back to you shortly',
    'contact.yourName': 'Your Name',
    'contact.emailAddress': 'Email Address',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'How can we help you?',
    'contact.send': 'Send Message',
    'contact.sent': 'Message Sent',
    'contact.sentDesc': 'Thank you for contacting us. We\'ll respond within 24 hours.',
    'contact.selectSubject': 'Select a subject',
    'contact.generalInquiry': 'General Inquiry',
    'contact.orderQuestion': 'Order Question',
    'contact.productInfo': 'Product Information',
    'contact.returns': 'Returns & Exchanges',
    'contact.feedback': 'Feedback',
    'contact.openMaps': 'Open in Google Maps',
    'contact.hoursMonFri': 'Monday - Friday',
    'contact.hoursSat': 'Saturday',
    'contact.hoursSun': 'Sunday',
    
    // Footer
    'footer.shop': 'Shop',
    'footer.allProducts': 'All Products',
    'footer.support': 'Support',
    'footer.contactUs': 'Contact Us',
    'footer.sizeGuide': 'Size Guide',
    'footer.shippingInfo': 'Shipping Info',
    'footer.returns': 'Returns',
    'footer.visitUs': 'Contact',
    'footer.address': '123 Fashion Street, Style District, NY 10001',
    'footer.phone': '(555) 123-4567',
    'footer.email': 'hello@dresscode.com',
    'footer.rights': '© 2026 DRESS CODE. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    
    // Common
    'common.color': 'Color',
    'common.size': 'Size',
    'common.new': 'New',
    'common newArrival': 'New Arrival',
  },
  gr: {
    // Header
    'nav.home': 'Αρχική',
    'nav.shop': 'Κατάστημα',
    'nav.contact': 'Επικοινωνία',
    'header.freeShipping': 'Δωρεάν αποστολή σε παραγγελίες άνω των $100',
    
    // Homepage
    'home.newCollection': 'Νέα Συλλογή 2026',
    'home.title1': 'DRESS',
    'home.title2': 'CODE',
    'home.subtitle': 'Επαναπροσδιορίστε το Στυλ σας',
    'home.subtitle2': 'Επιλεγμένα κομμάτια μόδας για τη σύγχρονη γυναίκα',
    'home.shopCollection': 'Αγορά Συλλογής',
    'home.visitStore': 'Επισκεφθείτε το Κατάστημα',
    'home.scroll': 'Κύλιση',
    'home.happyClients': 'Ικανοποιημένοι Πελάτες',
    'home.pieces': 'Κομμάτια',
    'home.brands': 'Μάρκες',
    'home.rating': 'Βαθμολογία',
    'home.categories': 'Κατηγορίες',
    'home.browseCollection': 'Εξερευνήστε τη Συλλογή',
    'home.dresses': 'Φορέματα',
    'home.tops': 'Μπλούζες',
    'home.pants': 'Παντελόνια',
    'home.skirts': 'Φούστες',
    'home.outerwear': 'Επανωφόρια',
    'home.accessories': 'Αξεσουάρ',
    'home.justLanded': 'Μόλις Έφτασαν',
    'home.newArrivals': 'Νέες Αφίξεις',
    'home.viewAll': 'Δείτε Όλα',
    'home.theEdit': 'Η Επιλογή',
    'home.timelessElegance': 'Αιώνια Κομψότητα',
    'home.timelessDesc': 'Η επιλεγμένη συλλογή μας φέρνει τα πιο εκλεκτά κομμάτια από όλο τον κόσμο. Κάθε αντικείμενο επιλέγεται για την ποιότητα, την κατασκευή και την αιώνια γοητεία του.',
    'home.discoverMore': 'Ανακαλύψτε Περισσότερα',
    'home.featured': 'Επιλεγμένα Για Εσάς',
    'home.featuredSelection': 'Προτεινόμενη Επιλογή',
    'home.testimonial': '"Η ποιότητα είναι εξαιρετική. Κάθε κομμάτι που αγόρασα έχει γίνει απαραίτητο στην ντουλάπα μου. Το DRESS CODE πραγματικά καταλαβαίνει τη σύγχρονη κομψότητα."',
    'home.testimonialAuthor': '— Σάρα Μίτσελ, Επαληθευμένη Πελάτισσα',
    'home.stayConnected': 'Μείνετε Συνδεδεμένοι',
    'home.newsletterDesc': 'Γίνετε οι πρώτοι που θα μάθουν για νέες αφίξεις και αποκλειστικές προσφορές',
    'home.emailPlaceholder': 'Η διεύθυνση email σας',
    'home.subscribe': 'Εγγραφή',
    'home.visitUs': 'Επισκεφθείτε μας',
    'home.contactLabel': 'Επικοινωνία',
    'home.hours': 'Ωράριο',
    'home.address': '123 Fashion Street, Style District, NY 10001',
    'home.phone': '(555) 123-4567',
    'home.email': 'hello@dresscode.com',
    'home.hoursText': 'Δευ - Σαβ: 9πμ - 8μμ, Κυρ: 11πμ - 5μμ',
    
    // Shop
    'shop.title': 'Κατάστημα',
    'shop.collection': 'Συλλογή',
    'shop.subtitle': 'Ανακαλύψτε το τέλειο στυλ σας',
    'shop.all': 'Όλα',
    'shop.products': 'Προϊόντα',
    'shop.product': 'Προϊόν',
    'shop.noProducts': 'Δεν βρέθηκαν προϊόντα',
    'shop.noProductsDesc': 'Δοκιμάστε να προσαρμόσετε τα φίλτρα σας',
    'shop.clearFilters': 'Καθαρισμός Φίλτρων',
    'shop.new': 'Νέο',
    'shop.soldOut': 'Εξαντλημένο',
    
    // Product
    'product.back': 'Πίσω',
    'product.sizeGuide': 'Οδηγός Μεγεθών',
    'product.quantity': 'Ποσότητα',
    'product.addToCart': 'Προσθήκη στο Καλάθι',
    'product.addedToCart': 'Προστέθηκε στο Καλάθι',
    'product.selectSize': 'Παρακαλώ επιλέξτε μέγεθος',
    'product.selectColor': 'Παρακαλώ επιλέξτε χρώμα',
    'product.complimentaryShipping': 'Δωρεάν αποστολή σε παραγγελίες άνω των $100',
    'product.cashOnDelivery': 'Διαθέσιμη αντικαταβολή',
    'product.easyReturns': 'Εύκολες επιστροφές εντός 30 ημερών',
    'product.details': 'Λεπτομέρειες',
    'product.description': 'Περιγραφή',
    'product.sizeFit': 'Μέγεθος & Εφαρμογή',
    'product.modelWearing': 'Το μοντέλο φοράει μέγεθος S',
    'product.fitsTrue': 'Εφαρμόζει στο μέγεθος',
    'product.referToGuide': 'Ανατρέξτε στον οδηγό μεγεθών για μετρήσεις',
    'product.notFound': 'Το Προϊόν Δεν Βρέθηκε',
    'product.backToShop': 'Πίσω στο Κατάστημα',
    
    // Cart
    'cart.title': 'Το Καλάθι σας',
    'cart.items': 'αντικείμενα',
    'cart.item': 'αντικείμενο',
    'cart.empty': 'Το καλάθι σας είναι άδειο',
    'cart.emptyDesc': 'Ξεκινήστε να προσθέτετε τα αγαπημένα σας αντικείμενα',
    'cart.startShopping': 'Αρχίστε τις Αγορές',
    'cart.subtotal': 'Υποσύνολο',
    'cart.shipping': 'Αποστολή',
    'cart.complimentary': 'Δωρεάν',
    'cart.total': 'Σύνολο',
    'cart.complimentaryShipping': 'Δωρεάν αποστολή περιλαμβάνεται',
    'cart.freeShippingProgress': 'Προσθέστε ${amount} ακόμη για δωρεάν αποστολή',
    'cart.proceedToCheckout': 'Ολοκλήρωση Αγοράς',
    'cart.continueShopping': 'Συνέχεια Αγορών',
    
    // Checkout
    'checkout.title': 'Ολοκλήρωση Αγοράς',
    'checkout.subtitle': 'Ολοκληρώστε την παραγγελία σας',
    'checkout.customerInfo': 'Στοιχεία Πελάτη',
    'checkout.deliveryAddress': 'Διεύθυνση Παράδοσης',
    'checkout.paymentMethod': 'Τρόπος Πληρωμής',
    'checkout.firstName': 'Όνομα',
    'checkout.lastName': 'Επώνυμο',
    'checkout.email': 'Email',
    'checkout.phone': 'Τηλέφωνο',
    'checkout.address': 'Διεύθυνση',
    'checkout.city': 'Πόλη',
    'checkout.zipCode': 'Ταχυδρομικός Κώδικας',
    'checkout.notes': 'Σημειώσεις Παραγγελίας (Προαιρετικά)',
    'checkout.notesPlaceholder': 'Ειδικές οδηγίες παράδοσης...',
    'checkout.cashOnDelivery': 'Αντικαταβολή',
    'checkout.cashOnDeliveryDesc': 'Πληρώστε όταν η παραγγελία φτάσει στην πόρτα σας',
    'checkout.placeOrder': 'Ολοκλήρωση Παραγγελίας',
    'checkout.orderSummary': 'Σύνοψη Παραγγελίας',
    'checkout.items': 'Αντικείμενα',
    'checkout.complimentaryShipping': 'Δωρεάν αποστολή περιλαμβάνεται',
    'checkout.freeShippingProgress': 'Προσθέστε ${amount} ακόμη για δωρεάν αποστολή',
    'checkout.emptyCart': 'Το καλάθι σας είναι άδειο',
    'checkout.thankYou': 'Ευχαριστούμε',
    'checkout.orderId': 'Κωδικός Παραγγελίας',
    'checkout.confirmationDesc': 'Θα επικοινωνήσουμε μαζί σας σύντομα για να επιβεβαιώσουμε τα στοιχεία της παραγγελίας σας. Η πληρωμή θα γίνει κατά την παράδοση.',
    'checkout.backToHome': 'Πίσω στην Αρχική',
    'checkout.continueShopping': 'Συνέχεια Αγορών',
    
    // Contact
    'contact.title': 'Επικοινωνία',
    'contact.getLabel': 'Επικοινωνήστε μαζί μας',
    'contact.subtitle': 'Θα χαρούμε να ακούσουμε από εσάς',
    'contact.visitStore': 'Επισκεφθείτε το Κατάστημά μας',
    'contact.callUs': 'Καλέστε μας',
    'contact.emailUs': 'Στείλτε μας Email',
    'contact.storeHours': 'Ωράριο Καταστήματος',
    'contact.followUs': 'Ακολουθήστε μας',
    'contact.sendMessage': 'Στείλτε μας Μήνυμα',
    'contact.sendMessageDesc': 'Συμπληρώστε την παρακάτω φόρμα και θα επικοινωνήσουμε μαζί σας σύντομα',
    'contact.yourName': 'Το Όνομά σας',
    'contact.emailAddress': 'Διεύθυνση Email',
    'contact.subject': 'Θέμα',
    'contact.message': 'Μήνυμα',
    'contact.messagePlaceholder': 'Πώς μπορούμε να σας βοηθήσουμε;',
    'contact.send': 'Αποστολή Μηνύματος',
    'contact.sent': 'Το Μήνυμα Εστάλη',
    'contact.sentDesc': 'Ευχαριστούμε που επικοινωνήσατε μαζί μας. Θα απαντήσουμε εντός 24 ωρών.',
    'contact.selectSubject': 'Επιλέξτε ένα θέμα',
    'contact.generalInquiry': 'Γενική Ερώτηση',
    'contact.orderQuestion': 'Ερώτηση Παραγγελίας',
    'contact.productInfo': 'Πληροφορίες Προϊόντος',
    'contact.returns': 'Επιστροφές & Ανταλλαγές',
    'contact.feedback': 'Σχόλια',
    'contact.openMaps': 'Άνοιγμα στο Google Maps',
    'contact.hoursMonFri': 'Δευτέρα - Παρασκευή',
    'contact.hoursSat': 'Σάββατο',
    'contact.hoursSun': 'Κυριακή',
    
    // Footer
    'footer.shop': 'Κατάστημα',
    'footer.allProducts': 'Όλα τα Προϊόντα',
    'footer.support': 'Υποστήριξη',
    'footer.contactUs': 'Επικοινωνία',
    'footer.sizeGuide': 'Οδηγός Μεγεθών',
    'footer.shippingInfo': 'Πληροφορίες Αποστολής',
    'footer.returns': 'Επιστροφές',
    'footer.visitUs': 'Επικοινωνία',
    'footer.address': '123 Fashion Street, Style District, NY 10001',
    'footer.phone': '(555) 123-4567',
    'footer.email': 'hello@dresscode.com',
    'footer.rights': '© 2026 DRESS CODE. Με επιφύλαξη παντός δικαιώματος.',
    'footer.privacy': 'Πολιτική Απορρήτου',
    'footer.terms': 'Όροι Χρήσης',
    
    // Common
    'common.color': 'Χρώμα',
    'common.size': 'Μέγεθος',
    'common.new': 'Νέο',
    'common.newArrival': 'Νέα Άφιξη',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
