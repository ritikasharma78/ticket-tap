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
        subject: `Booking Confirmed: "${booking.show.movie.title}"`,
        body: `
<div style="padding: 24px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 540px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">

    <div style="background: #F84565; padding: 28px 32px; text-align: center;">
      <p style="margin: 0; color: #fff; font-size: 24px; letter-spacing: 3px; text-transform: font-weight: 500;">TicketTap</p>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 1px;">Your booking is confirmed 🎉</p>
    </div>

    <div style="padding: 32px; background: #ffffff;">
      <p style="margin: 0 0 20px; color: #333333; font-size: 15px;">Hi <span style="color: #111111; font-weight: 500;">${booking.user.name}</span>,</p>
      <p style="margin: 0 0 24px; color: #666666; font-size: 14px; line-height: 1.7;">
        Your seats are locked in! Here's everything you need to know about your upcoming show.
      </p>

      <div style="background: #f9f9f9; border: 1px solid #eeeeee; border-radius: 10px; padding: 22px; margin-bottom: 24px;">
        <p style="margin: 0 0 16px; color: #F84565; font-size: 19px; font-weight: 500;">${booking.show.movie.title}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 9px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 38%; border-bottom: 1px solid #eeeeee;">Date</td>
            <td style="padding: 9px 0; color: #111111; font-size: 13px; border-bottom: 1px solid #eeeeee;">
              ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" })}
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eeeeee;">Time</td>
            <td style="padding: 9px 0; color: #111111; font-size: 13px; border-bottom: 1px solid #eeeeee;">
              ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eeeeee;">Seats</td>
            <td style="padding: 9px 0; border-bottom: 1px solid #eeeeee;">
              ${booking.bookedSeats.map((seat) => `<span style="background: #F84565; color: #fff; font-size: 12px; padding: 3px 10px; border-radius: 20px; font-weight: 500; margin-right: 4px;">${seat}</span>`).join("")}
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
            <td style="padding: 9px 0; color: #111111; font-size: 13px; font-weight: 500;">₹${booking.amount}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.7; text-align: center;">
        Grab your popcorn and enjoy the show! 🍿<br/>See you at the movies.
      </p>
    </div>

    <div style="border-top: 1px solid #eeeeee; padding: 18px 32px; text-align: center; background: #fafafa;">
      <p style="margin: 0; color: #aaaaaa; font-size: 12px;">© 2026 TicketTap. All rights reserved.</p>
      <p style="margin: 5px 0 0; color: #aaaaaa; font-size: 11px;">This is an automated confirmation email, please do not reply.</p>
    </div>

  </div>
</div>`,
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
