import React from "react";
import {assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="px-6 mt-16 border-t border-gray-900 pt-8 md:px-16  lg:px-36 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <img alt="" class="h-12" src={assets.logo1} />
          <p className="mt-4 text-sm">
            TicketTap is a full-stack movie ticket booking platform built with React, Node.js, MongoDB, Clerk Authentication, and Stripe Payments providing a seamless experience for discovering and booking movies online.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="google play"
              className="h-9 w-auto"
            />
            <img
              src={assets.appStore}
              alt="app store"
              className="h-9 w-auto  "
            />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Profiles</h2>
            <ul className="text-sm space-y-2">
              
              <li>
                <a href="https://leetcode.com/u/ritikasharma11/">Leetcode</a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/ritikasharma11/">LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com/ritikasharma78">GitHub</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>sharma.ritika0504@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} ©{" "}
        <a href="">TicketTap</a>. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
