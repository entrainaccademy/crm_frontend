"use client";

import { useState } from "react";
import { getCountryCallingCode, parsePhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/reui/phone-input";

function initialPhone(value) {
  const phone = String(value || "").trim();
  if (phone.startsWith("+")) return phone;
  if (/^91\d{10}$/.test(phone)) return `+${phone}`;
  if (/^\d{10}$/.test(phone)) return `+91${phone}`;
  return "";
}

export function LeadPhoneField({ label, name, value, required = false }) {
  const [phone, setPhone] = useState(() => initialPhone(value));
  const [country, setCountry] = useState(() => parsePhoneNumber(initialPhone(value))?.country || "IN");
  const countryCode = `+${getCountryCallingCode(country)}`;

  return (
    <div className="lead-phone-field">
      <label htmlFor={`${name}-number`}>{label}</label>
      <input type="hidden" name={name} value={phone} />
      <input type="hidden" name={`${name}CountryCode`} value={countryCode} />
      <PhoneInput
        id={`${name}-number`}
        aria-label={label}
        defaultCountry={country}
        value={phone}
        onChange={setPhone}
        onCountryChange={(next) => { if (next) setCountry(next); }}
        placeholder="Enter phone number"
        required={required}
        className="lead-phone-control"
      />
    </div>
  );
}
