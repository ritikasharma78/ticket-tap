import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { sendEmail } from "../config/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//inngest functions to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: { event: "clerk/user.created" } },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.create(userData);
  },
);

//inngest functions to delete user from database

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk", triggers: { event: "clerk/user.deleted" } },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

//inngest functions to update user data in database

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: { event: "clerk/user.updated" } },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  },
);
//test

// Inngest Function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: { event: "app/checkpayment" },
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If payment is not made, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  },
);

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: { event: "app/show.booked" },
  },
  async ({ event, step }) => {
    const booking = await step.run("fetch-booking", async () => {
      return await Booking.findById(event.data.bookingId)
        .populate({
          path: "show",
          populate: { path: "movie", model: "Movie" },
        })
        .populate("user")
        .lean();
    });

    await step.run("send-confirmation-email", async () => {
      await sendEmail({
        to: booking.user.email,
        subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
        body: `
<div style="background-color: #0f0f0f; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #F84565; padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">TicketTap</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 1px;">Your booking is confirmed 🎉</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px 32px;">
      <p style="margin: 0 0 24px; color: #cccccc; font-size: 15px;">Hi <strong style="color: #ffffff;">${booking.user.name}</strong>,</p>
      <p style="margin: 0 0 28px; color: #cccccc; font-size: 15px; line-height: 1.6;">
        Your seats are locked in! Here's everything you need to know about your upcoming show.
      </p>

      <!-- Movie Card -->
      <div style="background-color: #252525; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
        <h2 style="margin: 0 0 16px; color: #F84565; font-size: 20px;">${booking.show.movie.title}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width: 40%;">Date</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">
              ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">
              ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Seats</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${booking.bookedSeats.join(", ")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">₹${booking.amount}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0; color: #888888; font-size: 13px; line-height: 1.6; text-align: center;">
        Grab your popcorn and enjoy the show! 🍿<br/>
        See you at the movies.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #2a2a2a; padding: 20px 32px; text-align: center;">
      <p style="margin: 0; color: #555555; font-size: 12px;">© 2026 TicketTap. All rights reserved.</p>
      <p style="margin: 6px 0 0; color: #555555; font-size: 12px;">This is an automated confirmation email, please do not reply.</p>
    </div>

  </div>
</div>
`,
      });
    });
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
];
