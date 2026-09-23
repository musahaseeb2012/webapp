/* ==========================================================================
   FALCORE RIDES — booking alerts

   Emails you the moment a booking request lands in Firestore, so you don't
   have to keep the dashboard open to find out.

   ⚠️  Cloud Functions need the Blaze (pay-as-you-go) plan. For a handful of
       bookings a month the bill is effectively nothing — the free allowance
       covers roughly two million calls — but a card has to be on file.
       The rest of the site works fine on the free Spark plan; this file is
       the only part that doesn't.

   Setup (once):

     cd functions && npm install

     firebase functions:secrets:set SMTP_HOST      # e.g. smtp.gmail.com
     firebase functions:secrets:set SMTP_PORT      # 465
     firebase functions:secrets:set SMTP_USER      # the mailbox to send from
     firebase functions:secrets:set SMTP_PASS      # an app password, not your
                                                   # normal one
     firebase functions:secrets:set ALERT_TO       # where alerts should land

     firebase deploy --only functions

   With Gmail you need an App Password (Google account → Security →
   2-Step Verification → App passwords). Your everyday password won't work,
   and it shouldn't — an app password can be revoked on its own.

   The credentials live in Google's Secret Manager, never in this repo.
   ========================================================================== */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const nodemailer = require('nodemailer');

const SMTP_HOST = defineSecret('SMTP_HOST');
const SMTP_PORT = defineSecret('SMTP_PORT');
const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');
const ALERT_TO  = defineSecret('ALERT_TO');

exports.onBookingCreated = onDocumentCreated(
  {
    document: 'bookings/{bookingId}',
    region: 'us-central1',
    secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ALERT_TO],
    retry: false
  },
  async (event) => {
    const booking = event.data && event.data.data();
    if (!booking) return;

    const port = Number(SMTP_PORT.value() || 465);

    const transport = nodemailer.createTransport({
      host: SMTP_HOST.value(),
      port,
      secure: port === 465,          // 465 is implicit TLS; 587 upgrades with STARTTLS
      auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() }
    });

    const line = (label, value) => `${label.padEnd(9)} ${value || '—'}`;

    const text = [
      'New booking request — Falcore Rides',
      '',
      line('Name:',    booking.name),
      line('Phone:',   booking.phone),
      line('Vehicle:', booking.vehicle),
      line('Size:',    booking.size),
      line('Service:', booking.service),
      '',
      'Notes:',
      booking.notes || '(none)',
      '',
      `Submitted: ${booking.submittedAt || event.time}`,
      '',
      'Open the dashboard to mark it done.'
    ].join('\n');

    try {
      await transport.sendMail({
        from: `"Falcore Rides" <${SMTP_USER.value()}>`,
        to: ALERT_TO.value(),
        // Replying to the alert goes nowhere useful, so make the subject
        // carry what you need at a glance on a phone.
        subject: `New booking — ${booking.name || 'someone'} (${booking.vehicle || 'vehicle'})`,
        text
      });
      logger.info('Booking alert sent', { bookingId: event.params.bookingId });
    } catch (err) {
      // Never throw: a failed email must not lose the booking, and with
      // retry:false a throw here would just be noise in the logs.
      logger.error('Could not send booking alert', {
        bookingId: event.params.bookingId,
        error: err.message
      });
    }
  }
);
