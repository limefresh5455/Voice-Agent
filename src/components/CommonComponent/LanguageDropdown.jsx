import React, { useState, useRef, useEffect } from "react";
import i18next from "i18next";

const languages = [
  { code: "en", name: "English (US)", flag: "https://flagcdn.com/us.svg" },
  { code: "es", name: "Spanish", flag: "https://flagcdn.com/es.svg" },
  {
    code: "pt",
    name: "Português (Brazil)",
    flag: "https://flagcdn.com/br.svg",
  },
];

const LanguageDropdown = () => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const getInitialLanguage = () => {
    const savedLang = sessionStorage.getItem("language");
    return languages.find((lang) => lang.code === savedLang) || languages[0];
  };
  const [selected, setSelected] = useState(getInitialLanguage);
  const handleSelect = (lang) => {
    setSelected(lang);
    i18next.changeLanguage(lang.code);
    sessionStorage.setItem("language", lang.code);
    setOpen(false);
  };
  useEffect(() => {
    i18next.changeLanguage(selected.code);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="lang_div"
      style={{ position: "relative" }}
    >
      <div onClick={() => setOpen(!open)} className="lang_inner_box">
        <div className="lang_icon">
          <img src={selected.flag} alt="" width="20" />
          <span>{selected.name}</span>
        </div>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            border: "1px solid #ddd",
            borderRadius: "6px",
            backgroundColor: "#fff",
            zIndex: 10,
          }}
        >
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <img src={lang.flag} alt="" width="20" />
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
