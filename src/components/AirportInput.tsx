"use client";

import { useEffect, useId, useRef, useState } from "react";
import { loadPlaces, searchPlaces, type Place } from "@/data/airports";

type AirportInputProps = {
  value: string;
  onChange: (value: string) => void;
  onPick?: (place: Place | null) => void;
  placeholder: string;
  label: string;
};

export default function AirportInput({ value, onChange, onPick, placeholder, label }: AirportInputProps) {
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = open ? searchPlaces(places, value) : [];

  useEffect(() => {
    let live = true;
    loadPlaces()
      .then((rows) => {
        if (live) setPlaces(rows);
      })
      .catch(() => {
        if (live) setPlaces([]);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [value]);

  function choose(place: Place) {
    onChange(place.label);
    onPick?.(place);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "ArrowDown" && value.trim().length >= 2) setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="va-airport" ref={boxRef}>
      <input
        className="va-input"
        role="combobox"
        aria-label={label}
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          onPick?.(null);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {open && value.trim().length >= 2 ? (
        <ul className="va-airport-list" id={listId} role="listbox">
          {results.length === 0 ? (
            <li className="va-airport-empty">Nenhum aeroporto encontrado</li>
          ) : (
            results.map((place, index) => (
              <li key={`${place.kind}-${place.code}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  className={`va-airport-opt ${index === active ? "va-airport-opt--on" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(place)}
                >
                  <span className="va-airport-code">{place.code}</span>
                  <span className="va-airport-copy">
                    <span className="va-airport-title">
                      {place.kind === "city" ? place.city : place.name}
                      <span className="va-airport-kind">{place.kind === "city" ? "Cidade" : "Aeroporto"}</span>
                    </span>
                    <span className="va-airport-meta">
                      {place.kind === "city"
                        ? `Inclui ${place.covers.join(", ")} · ${place.country}`
                        : `${place.city}${place.city ? " · " : ""}${place.country}`}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
