/* ==========================================================================
   FALCORE RIDES — Firebase settings

   Fill in the two values below and booking requests start landing in your
   Firestore database instead of the visitor's email app. Until then the form
   falls back to email on its own, so the site works either way.

   Where to find them:
     Firebase console → your project → ⚙ Project settings → General
     → "Your apps" → Web app → SDK setup and configuration

   The API key is NOT a secret. Firebase web keys are public identifiers —
   they end up in every visitor's browser no matter how you ship them. What
   actually protects the data is firestore.rules, which lets anyone submit a
   booking and lets nobody read one back.
   ========================================================================== */

window.FALCORE_FIREBASE = {
  projectId:  'car-detail-business',
  apiKey:     'AIzaSyC5cZ_JVngAl_0GG9fERAG_YZFX46ME2p4',

  // The Firestore collection requests are written to. Anything you like —
  // just keep it the same as the collection named in firestore.rules.
  collection: 'bookings'
};
