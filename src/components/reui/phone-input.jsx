"use client";

// Adapted from ReUI's Base UI phone input (MIT license).
import { createContext, useContext, useMemo, useState } from "react";
import BasePhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Globe2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";

const PhoneInputContext = createContext({ variant: "default", popupClassName: "" });

function PhoneInput({ className, variant = "default", popupClassName, onChange, value, ...props }) {
  return (
    <PhoneInputContext.Provider value={{ variant, popupClassName }}>
      <BasePhoneInput
        className={cn("flex min-w-0", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        smartCaret={false}
        value={value || undefined}
        onChange={(next) => onChange?.(next || "")}
        {...props}
      />
    </PhoneInputContext.Provider>
  );
}

function InputComponent({ className, ...props }) {
  const { variant } = useContext(PhoneInputContext);
  return (
    <Input
      className={cn("min-w-0 flex-1 rounded-l-none focus:z-10", variant === "lg" && "h-10", className)}
      {...props}
    />
  );
}

function CountrySelect({ disabled, value: selectedCountry, options, onChange }) {
  const { variant, popupClassName } = useContext(PhoneInputContext);
  const [search, setSearch] = useState("");
  const filteredCountries = useMemo(() => {
    const query = search.toLowerCase().trim();
    return options.filter(({ value, label }) => value && (
      label.toLowerCase().includes(query) || `+${getCountryCallingCode(value)}`.includes(query)
    ));
  }, [options, search]);

  return (
    <Combobox
      items={filteredCountries}
      value={selectedCountry || ""}
      onValueChange={(country) => { if (country) onChange(country); }}
    >
      <ComboboxTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={variant}
            className="h-[42px] rounded-r-none border-r-0 px-2.5 hover:bg-transparent focus:z-10"
            disabled={disabled}
          >
            <span className="sr-only"><ComboboxValue /></span>
            <FlagComponent country={selectedCountry} />
          </Button>
        }
      />
      <ComboboxContent className={cn("lead-phone-country-popup", popupClassName)}>
        <ComboboxInput
          aria-label="Search country or calling code"
          placeholder="Search country or code"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          showTrigger={false}
        />
        <ComboboxSeparator />
        <ComboboxEmpty>No country found.</ComboboxEmpty>
        <ComboboxList className="lead-phone-country-list">
          {filteredCountries.map(({ value, label }) => (
            <ComboboxItem key={value} value={value}>
              <FlagComponent country={value} />
              <span className="flex-1">{label}</span>
              <span className="text-gray-500">+{getCountryCallingCode(value)}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function FlagComponent({ country }) {
  const Flag = country && flags[country];
  return <span className="flex size-4 shrink-0 items-center justify-center">{Flag ? <Flag /> : <Globe2 size={16} />}</span>;
}

export { PhoneInput };
